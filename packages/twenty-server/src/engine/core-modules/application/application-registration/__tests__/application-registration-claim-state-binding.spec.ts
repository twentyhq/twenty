import * as jwt from 'jsonwebtoken';

import { ApplicationRegistrationClaimService } from 'src/engine/core-modules/application/application-registration/application-registration-claim.service';
import { ApplicationRegistrationExceptionCode } from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const SIGNING_SECRET = 'test-secret';
const ATTACKER_WORKSPACE_ID = '11111111-1111-4111-8111-111111111111';
const REGISTRATION_ID = '33333333-3333-4333-8333-333333333333';

const buildProvenanceResponse = (repository: string) => ({
  data: {
    attestations: [
      {
        predicateType: 'https://slsa.dev/provenance/v1',
        bundle: {
          dsseEnvelope: {
            payload: Buffer.from(
              JSON.stringify({
                predicate: {
                  buildDefinition: {
                    externalParameters: { workflow: { repository } },
                  },
                },
              }),
            ).toString('base64'),
          },
        },
      },
    ],
  },
});

const setupService = () => {
  const registration = {
    id: REGISTRATION_ID,
    ownerWorkspaceId: null,
    sourceType: ApplicationRegistrationSourceType.NPM,
    sourcePackage: '@publisher-org/app',
    latestAvailableVersion: '1.0.0',
  };

  const claimOwnership = jest
    .fn()
    .mockImplementation(async ({ claimingWorkspaceId }) => ({
      ...registration,
      ownerWorkspaceId: claimingWorkspaceId,
    }));

  const attachNonceToResponse = jest.fn();

  const service = new ApplicationRegistrationClaimService(
    { findOne: jest.fn() } as never,
    {
      findOneByIdGlobal: jest.fn().mockResolvedValue(registration),
      claimOwnership,
    } as never,
    {
      signAsyncOrThrow: jest
        .fn()
        .mockImplementation(async (payload, options) =>
          jwt.sign(payload, SIGNING_SECRET, { expiresIn: options.expiresIn }),
        ),
      verifyJwtToken: jest
        .fn()
        .mockImplementation(async (token) => jwt.verify(token, SIGNING_SECRET)),
      decode: jest.fn().mockImplementation((token) => jwt.decode(token)),
    } as never,
    {
      get: jest.fn().mockImplementation(
        (key: string) =>
          ({
            APP_CLAIM_GITHUB_CLIENT_ID: 'client-id',
            APP_CLAIM_GITHUB_CLIENT_SECRET: 'client-secret',
            APP_REGISTRY_URL: 'https://registry.npmjs.org',
            SERVER_URL: 'https://app.twenty.test',
          })[key],
      ),
    } as never,
    { attachNonceToResponse } as never,
  );

  return { service, claimOwnership, attachNonceToResponse };
};

const stubPublisherIsOrgAdmin = () => {
  mockedAxios.get.mockImplementation(async (url: string) => {
    if (url.includes('/-/npm/v1/attestations/')) {
      return buildProvenanceResponse('https://github.com/publisher-org/app');
    }

    if (url === 'https://api.github.com/user') {
      return { data: { login: 'publisher-maintainer' } };
    }

    return { data: { state: 'active', role: 'admin' } };
  });
  mockedAxios.post.mockResolvedValue({ data: { access_token: 'token' } });
};

const startClaim = async (
  service: ApplicationRegistrationClaimService,
  response: unknown,
) => {
  const authorizationUrl = await service.buildGithubAuthorizationUrl({
    applicationRegistrationId: REGISTRATION_ID,
    workspaceId: ATTACKER_WORKSPACE_ID,
    userId: 'user-id',
    response: response as never,
  });

  return new URL(authorizationUrl).searchParams.get('state') as string;
};

describe('ApplicationRegistrationClaimService claim state binding', () => {
  beforeEach(() => {
    jest.useRealTimers();
    stubPublisherIsOrgAdmin();
  });

  it('issues a single-use nonce cookie alongside the authorization url', async () => {
    const { service, attachNonceToResponse } = setupService();

    await startClaim(service, {});

    expect(attachNonceToResponse).toHaveBeenCalledTimes(1);

    const [{ nonce, maxAgeMs, applicationRegistrationId }] =
      attachNonceToResponse.mock.calls[0];

    expect(nonce).toHaveLength(64);
    expect(maxAgeMs).toBe(15 * 60 * 1000);
    expect(applicationRegistrationId).toBe(REGISTRATION_ID);
  });

  it('completes the claim for the browser that started it', async () => {
    const { service, claimOwnership, attachNonceToResponse } = setupService();

    const state = await startClaim(service, {});
    const [{ nonce }] = attachNonceToResponse.mock.calls[0];

    await service.completeGithubClaim({
      statePayload: await service.verifyClaimState(state),
      code: 'code',
      stateNonce: nonce,
    });

    expect(claimOwnership).toHaveBeenCalledWith({
      applicationRegistrationId: REGISTRATION_ID,
      claimingWorkspaceId: ATTACKER_WORKSPACE_ID,
    });
  });

  it('rejects a forwarded authorization url completed from another browser', async () => {
    const { service, claimOwnership } = setupService();

    const state = await startClaim(service, {});

    await expect(
      service.completeGithubClaim({
        statePayload: await service.verifyClaimState(state),
        code: 'victim-code',
        stateNonce: undefined,
      }),
    ).rejects.toMatchObject({
      code: ApplicationRegistrationExceptionCode.CLAIM_STATE_MISMATCH,
    });

    expect(claimOwnership).not.toHaveBeenCalled();
  });

  it('rejects a nonce that belongs to another claim', async () => {
    const { service, claimOwnership, attachNonceToResponse } = setupService();

    const state = await startClaim(service, {});

    await startClaim(service, {});
    const [{ nonce: otherClaimNonce }] = attachNonceToResponse.mock.calls[1];

    await expect(
      service.completeGithubClaim({
        statePayload: await service.verifyClaimState(state),
        code: 'code',
        stateNonce: otherClaimNonce,
      }),
    ).rejects.toMatchObject({
      code: ApplicationRegistrationExceptionCode.CLAIM_STATE_MISMATCH,
    });

    expect(claimOwnership).not.toHaveBeenCalled();
  });

  it('rejects a state minted before the nonce binding existed', async () => {
    const { service, claimOwnership } = setupService();

    const legacyState = jwt.sign(
      {
        sub: REGISTRATION_ID,
        type: 'APPLICATION_REGISTRATION_GITHUB_CLAIM_STATE',
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: ATTACKER_WORKSPACE_ID,
        userId: null,
      },
      SIGNING_SECRET,
      { expiresIn: '15m' },
    );

    await expect(
      service.completeGithubClaim({
        statePayload: await service.verifyClaimState(legacyState),
        code: 'code',
        stateNonce: 'anything',
      }),
    ).rejects.toMatchObject({
      code: ApplicationRegistrationExceptionCode.CLAIM_STATE_MISMATCH,
    });

    expect(claimOwnership).not.toHaveBeenCalled();
  });
});
