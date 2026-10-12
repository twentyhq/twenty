import { isBoolean } from '@sniptt/guards';
import { assertUnreachable } from 'twenty-shared/utils';

import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';

const isVariantAccepted = <TVariant extends string>(
  kindConfig: boolean | Record<TVariant, boolean>,
  variant: TVariant,
): boolean => (isBoolean(kindConfig) ? kindConfig : kindConfig[variant]);

export const isAuthPrincipalVariantAccepted = ({
  authPrincipalGuardConfig,
  authPrincipalVariant,
}: {
  authPrincipalGuardConfig: AuthPrincipalGuardConfig;
  authPrincipalVariant: AuthPrincipalVariant;
}): boolean => {
  switch (authPrincipalVariant.kind) {
    case 'userSession':
      return isVariantAccepted(
        authPrincipalGuardConfig.userSession,
        authPrincipalVariant.variant,
      );
    case 'apiKey':
      return authPrincipalGuardConfig.apiKey;
    case 'oauthClient':
    case 'application':
      return isVariantAccepted(
        authPrincipalGuardConfig[authPrincipalVariant.kind],
        authPrincipalVariant.variant,
      );
    default:
      return assertUnreachable(authPrincipalVariant);
  }
};
