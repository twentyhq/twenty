import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { assertLoginTokenIsNotForImpersonation } from 'src/engine/core-modules/auth/utils/assert-login-token-is-not-for-impersonation.util';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

describe('assertLoginTokenIsNotForImpersonation', () => {
  it('accepts a regular login token', () => {
    expect(() =>
      assertLoginTokenIsNotForImpersonation({
        authProvider: AuthProviderEnum.Password,
      }),
    ).not.toThrow();
  });

  it('rejects a login token issued for impersonation', () => {
    expect(() =>
      assertLoginTokenIsNotForImpersonation({
        authProvider: AuthProviderEnum.Impersonation,
        impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
      }),
    ).toThrow(AuthException);
  });

  it('rejects a login token carrying an impersonator even with another provider', () => {
    expect(() =>
      assertLoginTokenIsNotForImpersonation({
        authProvider: AuthProviderEnum.Password,
        impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
      }),
    ).toThrow(AuthException);
  });
});
