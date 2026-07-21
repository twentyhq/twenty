import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import axios from 'axios';

import { ApplicationRegistrationClaimService } from 'src/engine/core-modules/application/application-registration/application-registration-claim.service';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationRegistrationGithubClaimStateJwtPayload } from 'src/engine/core-modules/auth/types/application-registration-github-claim-state-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const WORKSPACE_ID = 'workspace-1';
const REGISTRATION_ID = 'registration-1';

const CONFIG_VALUES: Record<string, string> = {
  APP_CLAIM_GITHUB_CLIENT_ID: 'github-client-id',
  APP_CLAIM_GITHUB_CLIENT_SECRET: 'github-client-secret',
  APP_REGISTRY_URL: 'https://registry.npmjs.org',
  SERVER_URL: 'https://server.example.com',
};

const buildRegistration = (
  overrides: Partial<ApplicationRegistrationEntity> = {},
): ApplicationRegistrationEntity =>
  ({
    id: REGISTRATION_ID,
    universalIdentifier: 'universal-identifier-1',
    ownerWorkspaceId: null,
    sourceType: ApplicationRegistrationSourceType.NPM,
    sourcePackage: '@acme/my-twenty-app',
    latestAvailableVersion: '1.2.3',
    ...overrides,
  }) as ApplicationRegistrationEntity;

const buildAttestationsResponse = (repository: string) => ({
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
});

const STATE_PAYLOAD: ApplicationRegistrationGithubClaimStateJwtPayload = {
  sub: REGISTRATION_ID,
  type: JwtTokenTypeEnum.APPLICATION_REGISTRATION_GITHUB_CLAIM_STATE,
  applicationRegistrationId: REGISTRATION_ID,
  workspaceId: WORKSPACE_ID,
  userId: 'user-1',
};

describe('ApplicationRegistrationClaimService', () => {
  let service: ApplicationRegistrationClaimService;
  let applicationRegistrationService: jest.Mocked<ApplicationRegistrationService>;
  let jwtWrapperService: jest.Mocked<JwtWrapperService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationClaimService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ApplicationRegistrationService,
          useValue: {
            findOneByIdGlobal: jest.fn(),
            claimOwnership: jest.fn(),
          },
        },
        {
          provide: JwtWrapperService,
          useValue: {
            signAsyncOrThrow: jest.fn().mockResolvedValue('signed-state'),
            verifyJwtToken: jest.fn(),
            decode: jest.fn().mockReturnValue(STATE_PAYLOAD),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key: string) => CONFIG_VALUES[key]),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationRegistrationClaimService);
    applicationRegistrationService = module.get(ApplicationRegistrationService);
    jwtWrapperService = module.get(JwtWrapperService);
    mockedAxios.isAxiosError.mockReturnValue(false);
  });

  afterEach(() => jest.clearAllMocks());

  const expectException = async (
    promise: Promise<unknown>,
    code: ApplicationRegistrationExceptionCode,
  ) => {
    await expect(promise).rejects.toThrow(ApplicationRegistrationException);
    await promise.catch((error) => expect(error.code).toBe(code));
  };

  describe('buildGithubAuthorizationUrl', () => {
    it('rejects an already-owned registration', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration({ ownerWorkspaceId: 'other-workspace' }),
      );

      await expectException(
        service.buildGithubAuthorizationUrl({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
          userId: null,
        }),
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
      );
    });

    it('rejects a non-npm registration', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration({
          sourceType: ApplicationRegistrationSourceType.LOCAL,
          sourcePackage: null,
        }),
      );

      await expectException(
        service.buildGithubAuthorizationUrl({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
          userId: null,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_NOT_SUPPORTED,
      );
    });

    it('throws when the GitHub OAuth app is not configured', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      const configService = { APP_CLAIM_GITHUB_CLIENT_ID: '' };

      (
        service as unknown as {
          twentyConfigService: { get: jest.Mock };
        }
      ).twentyConfigService.get = jest.fn(
        (key: string) =>
          ({ ...CONFIG_VALUES, ...configService })[key] as string,
      );

      await expectException(
        service.buildGithubAuthorizationUrl({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
          userId: null,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_NOT_CONFIGURED,
      );
    });

    it('returns the GitHub authorization url with a signed state', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );

      const url = new URL(
        await service.buildGithubAuthorizationUrl({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
          userId: 'user-1',
        }),
      );

      expect(url.origin + url.pathname).toBe(
        'https://github.com/login/oauth/authorize',
      );
      expect(url.searchParams.get('client_id')).toBe('github-client-id');
      expect(url.searchParams.get('scope')).toBe('read:org');
      expect(url.searchParams.get('state')).toBe('signed-state');
      expect(url.searchParams.get('prompt')).toBe('select_account');
      expect(url.searchParams.get('redirect_uri')).toBe(
        'https://server.example.com/application-registration-claim/github/callback',
      );
      expect(jwtWrapperService.signAsyncOrThrow).toHaveBeenCalledWith(
        STATE_PAYLOAD,
        expect.objectContaining({ expiresIn: '15m' }),
      );
    });
  });

  describe('completeGithubClaim', () => {
    it('throws when no provenance attestation exists', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      const notFoundError = Object.assign(new Error('Request failed'), {
        response: { status: 404 },
      });

      mockedAxios.get.mockRejectedValueOnce(notFoundError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expectException(
        service.completeGithubClaim({
          statePayload: STATE_PAYLOAD,
          code: 'oauth-code',
        }),
        ApplicationRegistrationExceptionCode.PROVENANCE_NOT_FOUND,
      );
    });

    it('reports a registry outage without blaming the provenance', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      mockedAxios.get.mockRejectedValueOnce(new Error('ETIMEDOUT'));

      await expectException(
        service.completeGithubClaim({
          statePayload: STATE_PAYLOAD,
          code: 'oauth-code',
        }),
        ApplicationRegistrationExceptionCode.PROVENANCE_CHECK_UNAVAILABLE,
      );
    });

    it('claims when the connected user is the publishing account', async () => {
      const claimed = buildRegistration({ ownerWorkspaceId: WORKSPACE_ID });

      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      applicationRegistrationService.claimOwnership.mockResolvedValue(claimed);
      mockedAxios.get.mockImplementation(async (url: string) => {
        if (url.includes('/attestations/')) {
          return {
            data: buildAttestationsResponse('https://github.com/acme/my-app'),
          };
        }
        if (url.endsWith('/user')) {
          return { data: { login: 'Acme' } };
        }
        throw new Error(`Unexpected GET ${url}`);
      });
      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'github-token' },
      });

      const result = await service.completeGithubClaim({
        statePayload: STATE_PAYLOAD,
        code: 'oauth-code',
      });

      expect(
        applicationRegistrationService.claimOwnership,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: REGISTRATION_ID,
        claimingWorkspaceId: WORKSPACE_ID,
      });
      expect(result).toBe(claimed);
    });

    it('claims when the connected user owns the publishing organization', async () => {
      const claimed = buildRegistration({ ownerWorkspaceId: WORKSPACE_ID });

      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      applicationRegistrationService.claimOwnership.mockResolvedValue(claimed);
      mockedAxios.get.mockImplementation(async (url: string) => {
        if (url.includes('/attestations/')) {
          return {
            data: buildAttestationsResponse('https://github.com/acme/my-app'),
          };
        }
        if (url.endsWith('/user')) {
          return { data: { login: 'someone-else' } };
        }
        if (url.includes('/user/memberships/orgs/acme')) {
          return { data: { state: 'active', role: 'admin' } };
        }
        throw new Error(`Unexpected GET ${url}`);
      });
      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'github-token' },
      });

      const result = await service.completeGithubClaim({
        statePayload: STATE_PAYLOAD,
        code: 'oauth-code',
      });

      expect(result).toBe(claimed);
    });

    it('rejects a member who is not an owner of the publishing organization', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      mockedAxios.get.mockImplementation(async (url: string) => {
        if (url.includes('/attestations/')) {
          return {
            data: buildAttestationsResponse('https://github.com/acme/my-app'),
          };
        }
        if (url.endsWith('/user')) {
          return { data: { login: 'someone-else' } };
        }
        if (url.includes('/user/memberships/orgs/acme')) {
          return { data: { state: 'active', role: 'member' } };
        }
        throw new Error(`Unexpected GET ${url}`);
      });
      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'github-token' },
      });

      await expectException(
        service.completeGithubClaim({
          statePayload: STATE_PAYLOAD,
          code: 'oauth-code',
        }),
        ApplicationRegistrationExceptionCode.GITHUB_ORG_OWNERSHIP_REQUIRED,
      );
      expect(
        applicationRegistrationService.claimOwnership,
      ).not.toHaveBeenCalled();
    });

    it('fails when the GitHub code exchange fails', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      mockedAxios.get.mockResolvedValue({
        data: buildAttestationsResponse('https://github.com/acme/my-app'),
      });
      mockedAxios.post.mockRejectedValue(new Error('bad code'));

      await expectException(
        service.completeGithubClaim({
          statePayload: STATE_PAYLOAD,
          code: 'oauth-code',
        }),
        ApplicationRegistrationExceptionCode.GITHUB_AUTH_FAILED,
      );
    });
  });

  describe('verifyClaimState', () => {
    it('rejects a state token of the wrong type', async () => {
      jwtWrapperService.decode.mockReturnValue({
        ...STATE_PAYLOAD,
        type: 'SOMETHING_ELSE',
      } as never);

      await expectException(
        service.verifyClaimState('state-token'),
        ApplicationRegistrationExceptionCode.GITHUB_AUTH_FAILED,
      );
    });

    it('returns the payload of a valid state token', async () => {
      const payload = await service.verifyClaimState('state-token');

      expect(payload).toEqual(STATE_PAYLOAD);
      expect(jwtWrapperService.verifyJwtToken).toHaveBeenCalledWith(
        'state-token',
      );
    });
  });
});
