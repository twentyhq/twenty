/* @license Enterprise */

import { type Request } from 'express';

import { type SSOService } from 'src/engine/core-modules/sso/services/sso.service';

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
  } as unknown as Request;
};

const buildProfile = (email: string = VALID_EMAIL) =>
  ({
    email,
    nameID: email,
    issuer: 'irrelevant',
  }) as unknown as Parameters<SamlAuthStrategy['validate']>[1];

describe('SamlAuthStrategy.validate', () => {
  let strategy: SamlAuthStrategy;

  beforeEach(() => {
    const ssoService = {
      findSSOIdentityProviderById: jest.fn(),
      isSAMLIdentityProvider: jest.fn(),
      buildIssuerURL: jest.fn(),
      buildCallbackUrl: jest.fn(),
    } as unknown as SSOService;

    strategy = new SamlAuthStrategy(ssoService);
  });

  // Regression test for the workspace-confusion finding. An attacker-controlled
  // RelayState that claims a different identity-provider id than the one whose
  // cert verified the assertion must have zero influence on the resolved IdP.
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

    await strategy.validate(
      request,
      undefined as unknown as Parameters<SamlAuthStrategy['validate']>[1],
      done,
    );

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(done.mock.calls[0][0].message).toBe('Profile must be provided');
  });
});
