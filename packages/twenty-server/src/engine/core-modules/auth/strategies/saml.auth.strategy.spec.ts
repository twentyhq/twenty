/* @license Enterprise */

import { Test } from '@nestjs/testing';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';

import { SamlAuthStrategy } from './saml.auth.strategy';

const IDP_A = 'idp-a-uuid';
const IDP_B = 'idp-b-uuid';
const VALID_EMAIL = 'alice@example.com';

type RelayStateInput =
  | { kind: 'absent' }
  | { kind: 'raw'; value: string }
  | { kind: 'json'; value: Record<string, unknown> };

const buildRequest = ({
  paramsIdpId,
  relayState = { kind: 'absent' },
}: {
  paramsIdpId: string;
  relayState?: RelayStateInput;
}) => {
  let body: Record<string, unknown> = {};

  if (relayState.kind === 'raw') {
    body = { RelayState: relayState.value };
  } else if (relayState.kind === 'json') {
    body = { RelayState: JSON.stringify(relayState.value) };
  }

  return {
    params: { identityProviderId: paramsIdpId },
    body,
  };
};

const BEARER_METHOD = 'urn:oasis:names:tc:SAML:2.0:cm:bearer';
const SENDER_VOUCHES_METHOD = 'urn:oasis:names:tc:SAML:2.0:cm:sender-vouches';

const buildSubjectConfirmation = ({
  method = BEARER_METHOD,
  notOnOrAfter = '2099-01-01T00:00:00.000Z',
}: {
  method?: string;
  notOnOrAfter?: string;
} = {}) => ({
  $: { Method: method },
  SubjectConfirmationData: [{ $: { NotOnOrAfter: notOnOrAfter } }],
});

const buildProfile = ({
  email = VALID_EMAIL,
  subjectConfirmations = [buildSubjectConfirmation()],
}: {
  email?: string;
  subjectConfirmations?: Record<string, unknown>[];
} = {}): Parameters<SamlAuthStrategy['validate']>[1] => ({
  email,
  nameID: email,
  nameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  issuer: 'irrelevant',
  getAssertionXml: () => '',
  getAssertion: () => ({
    Assertion: {
      $: { ID: 'assertion-id' },
      Subject: [{ SubjectConfirmation: subjectConfirmations }],
    },
  }),
  getSamlResponseXml: () => '',
});

describe('SamlAuthStrategy.validate', () => {
  let strategy: SamlAuthStrategy;
  let consumeSamlAssertion: jest.Mock;

  beforeEach(async () => {
    consumeSamlAssertion = jest.fn().mockResolvedValue(true);

    const module = await Test.createTestingModule({
      providers: [
        SamlAuthStrategy,
        {
          provide: SsoService,
          useValue: {
            findSsoIdentityProviderById: jest.fn(),
            isSamlIdentityProvider: jest.fn(),
            buildIssuerURL: jest.fn(),
            buildCallbackUrl: jest.fn(),
            consumeSamlAssertion,
          },
        },
      ],
    }).compile();

    strategy = module.get(SamlAuthStrategy);
  });

  // A RelayState claiming another IdP than the one whose cert verified the assertion must not influence the resolved IdP
  it('ignores RelayState.identityProviderId and sources it exclusively from the URL path', async () => {
    const request = buildRequest({
      paramsIdpId: IDP_A,
      relayState: { kind: 'json', value: { identityProviderId: IDP_B } },
    });
    const done = jest.fn();

    await strategy.validate(request, buildProfile(), done);

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeNull();
    expect(done.mock.calls[0][1]).toEqual({
      identityProviderId: IDP_A,
      workspaceInviteHash: undefined,
      email: VALID_EMAIL,
    });
  });

  it('still resolves identityProviderId from the URL path when RelayState mixes a malicious id with a real invite hash', async () => {
    const request = buildRequest({
      paramsIdpId: IDP_A,
      relayState: {
        kind: 'json',
        value: {
          identityProviderId: IDP_B,
          workspaceInviteHash: 'invite-hash-123',
        },
      },
    });
    const done = jest.fn();

    await strategy.validate(request, buildProfile(), done);

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeNull();
    expect(done.mock.calls[0][1]).toEqual({
      identityProviderId: IDP_A,
      workspaceInviteHash: 'invite-hash-123',
      email: VALID_EMAIL,
    });
  });

  it('tolerates malformed RelayState JSON without throwing (no invite hash extracted)', async () => {
    const request = buildRequest({
      paramsIdpId: IDP_A,
      relayState: { kind: 'raw', value: 'not-json{' },
    });
    const done = jest.fn();

    await strategy.validate(request, buildProfile(), done);

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeNull();
    expect(done.mock.calls[0][1]).toEqual({
      identityProviderId: IDP_A,
      workspaceInviteHash: undefined,
      email: VALID_EMAIL,
    });
  });

  it('ignores non-string workspaceInviteHash payloads in RelayState', async () => {
    const request = buildRequest({
      paramsIdpId: IDP_A,
      relayState: {
        kind: 'json',
        value: { workspaceInviteHash: { nested: 'object' } },
      },
    });
    const done = jest.fn();

    await strategy.validate(request, buildProfile(), done);

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeNull();
    expect(done.mock.calls[0][1]).toEqual({
      identityProviderId: IDP_A,
      workspaceInviteHash: undefined,
      email: VALID_EMAIL,
    });
  });

  it('rejects auth when the email claim is invalid', async () => {
    const request = buildRequest({ paramsIdpId: IDP_A });
    const done = jest.fn();

    await strategy.validate(
      request,
      buildProfile({ email: 'not-an-email' }),
      done,
    );

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(done.mock.calls[0][0].message).toBe('Invalid email');
  });

  it('rejects auth when the profile is missing', async () => {
    const request = buildRequest({ paramsIdpId: IDP_A });
    const done = jest.fn();

    await strategy.validate(request, null, done);

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(done.mock.calls[0][0].message).toBe('Profile must be provided');
  });

  it('rejects an assertion whose SubjectConfirmationData NotOnOrAfter has passed', async () => {
    const request = buildRequest({ paramsIdpId: IDP_A });
    const done = jest.fn();

    await strategy.validate(
      request,
      buildProfile({
        subjectConfirmations: [
          buildSubjectConfirmation({
            notOnOrAfter: '2000-01-01T00:00:00.000Z',
          }),
        ],
      }),
      done,
    );

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeInstanceOf(AuthException);
    expect(done.mock.calls[0][0].message).toBe('SAML assertion has expired');
    expect(consumeSamlAssertion).not.toHaveBeenCalled();
  });

  it('accepts a bearer confirmation alongside a non-bearer confirmation without SubjectConfirmationData', async () => {
    const request = buildRequest({ paramsIdpId: IDP_A });
    const done = jest.fn();

    await strategy.validate(
      request,
      buildProfile({
        subjectConfirmations: [
          { $: { Method: SENDER_VOUCHES_METHOD } },
          buildSubjectConfirmation(),
        ],
      }),
      done,
    );

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeNull();
    expect(consumeSamlAssertion).toHaveBeenCalledWith({
      identityProviderId: IDP_A,
      assertionId: 'assertion-id',
      validUntil: new Date('2099-01-01T00:00:00.000Z'),
    });
  });

  it('rejects an assertion whose only NotOnOrAfter is on a non-bearer confirmation', async () => {
    const request = buildRequest({ paramsIdpId: IDP_A });
    const done = jest.fn();

    await strategy.validate(
      request,
      buildProfile({
        subjectConfirmations: [
          buildSubjectConfirmation({ method: SENDER_VOUCHES_METHOD }),
        ],
      }),
      done,
    );

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeInstanceOf(AuthException);
    expect(done.mock.calls[0][0].message).toBe(
      'SAML assertion has no ID or bearer NotOnOrAfter',
    );
    expect(consumeSamlAssertion).not.toHaveBeenCalled();
  });
});
