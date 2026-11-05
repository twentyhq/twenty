/* @license Enterprise */

import { Test } from '@nestjs/testing';

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

const buildProfile = (
  email: string = VALID_EMAIL,
): Parameters<SamlAuthStrategy['validate']>[1] => ({
  email,
  nameID: email,
  nameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  issuer: 'irrelevant',
  getAssertionXml: () => '',
  getAssertion: () => ({}),
  getSamlResponseXml: () => '',
});

describe('SamlAuthStrategy.validate', () => {
  let strategy: SamlAuthStrategy;

  beforeEach(async () => {
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

  it('accepts a request with no RelayState at all (no workspaceInviteHash threaded through)', async () => {
    const request = buildRequest({ paramsIdpId: IDP_A });
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

  it('threads workspaceInviteHash from RelayState through to req.user', async () => {
    const request = buildRequest({
      paramsIdpId: IDP_A,
      relayState: {
        kind: 'json',
        value: { workspaceInviteHash: 'invite-hash-123' },
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

    await strategy.validate(request, buildProfile('not-an-email'), done);

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
});
