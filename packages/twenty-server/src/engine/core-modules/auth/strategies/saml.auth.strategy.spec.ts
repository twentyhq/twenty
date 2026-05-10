import { type Request } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type SSOService } from 'src/engine/core-modules/sso/services/sso.service';

import { SamlAuthStrategy } from './saml.auth.strategy';

const IDP_A = 'idp-a-uuid';
const IDP_B = 'idp-b-uuid';
const VALID_EMAIL = 'alice@example.com';

const buildRequest = ({
  paramsIdpId,
  relayStateIdpId,
  workspaceInviteHash,
  omitRelayState,
}: {
  paramsIdpId: string;
  relayStateIdpId?: string;
  workspaceInviteHash?: string;
  omitRelayState?: boolean;
}) =>
  ({
    params: { identityProviderId: paramsIdpId },
    body: omitRelayState
      ? {}
      : {
          RelayState: JSON.stringify({
            identityProviderId: relayStateIdpId,
            ...(workspaceInviteHash ? { workspaceInviteHash } : {}),
          }),
        },
  }) as unknown as Request;

const buildProfile = (email = VALID_EMAIL) =>
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

  it('rejects auth when RelayState.identityProviderId disagrees with the path param (workspace-confusion attempt)', async () => {
    const request = buildRequest({
      paramsIdpId: IDP_A,
      relayStateIdpId: IDP_B,
    });
    const done = jest.fn();

    await strategy.validate(request, buildProfile(), done);

    expect(done).toHaveBeenCalledTimes(1);
    const err = done.mock.calls[0][0];

    expect(err).toBeInstanceOf(AuthException);
    expect(err.code).toBe(AuthExceptionCode.INVALID_INPUT);
    expect(err.message).toMatch(/identity provider mismatch/i);
    expect(done.mock.calls[0][1]).toBeUndefined();
  });

  it('binds req.user.identityProviderId to the path param (verified IdP), not RelayState, on the happy path', async () => {
    const request = buildRequest({
      paramsIdpId: IDP_A,
      relayStateIdpId: IDP_A,
      workspaceInviteHash: 'invite-hash-123',
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

  it('rejects auth when RelayState is missing entirely', async () => {
    const request = buildRequest({
      paramsIdpId: IDP_A,
      omitRelayState: true,
    });
    const done = jest.fn();

    await strategy.validate(request, buildProfile(), done);

    expect(done).toHaveBeenCalledTimes(1);
    const err = done.mock.calls[0][0];

    expect(err).toBeInstanceOf(AuthException);
    expect(err.code).toBe(AuthExceptionCode.INVALID_INPUT);
  });

  it('rejects auth when the email claim is invalid', async () => {
    const request = buildRequest({
      paramsIdpId: IDP_A,
      relayStateIdpId: IDP_A,
    });
    const done = jest.fn();

    await strategy.validate(request, buildProfile('not-an-email'), done);

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(done.mock.calls[0][0].message).toBe('Invalid email');
  });

  it('rejects auth when the profile is missing', async () => {
    const request = buildRequest({
      paramsIdpId: IDP_A,
      relayStateIdpId: IDP_A,
    });
    const done = jest.fn();

    await strategy.validate(
      request,
      undefined as unknown as Parameters<SamlAuthStrategy['validate']>[1],
      done,
    );

    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(done.mock.calls[0][0].message).toBe('Profile is must be provided');
  });
});
