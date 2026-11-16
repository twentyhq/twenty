import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { assertImpersonationLoginTokenHasImpersonator } from 'src/engine/core-modules/auth/utils/assert-impersonation-login-token-has-impersonator.util';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

describe('assertImpersonationLoginTokenHasImpersonator', () => {
  it('accepts a regular login token, which names no impersonator', () => {
    expect(() =>
      assertImpersonationLoginTokenHasImpersonator({
        authProvider: AuthProviderEnum.Password,
      }),
    ).not.toThrow();
  });

  it('accepts an impersonation login token naming its impersonator', () => {
    expect(() =>
      assertImpersonationLoginTokenHasImpersonator({
        authProvider: AuthProviderEnum.Impersonation,
        impersonatorUserWorkspaceId: '20202020-1e7c-43d9-a5db-685b5069d816',
      }),
    ).not.toThrow();
  });

  it.each([undefined, ''])(
    'rejects an impersonation login token whose impersonator is %p',
    (impersonatorUserWorkspaceId) => {
      expect(() =>
        assertImpersonationLoginTokenHasImpersonator({
          authProvider: AuthProviderEnum.Impersonation,
          impersonatorUserWorkspaceId,
        }),
      ).toThrow(AuthException);
    },
  );
});
