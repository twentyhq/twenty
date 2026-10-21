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
      return isVariantAccepted(
        authPrincipalGuardConfig.oauthClient,
        authPrincipalVariant.variant,
      );
    case 'application': {
      const applicationConfig = authPrincipalGuardConfig.application;

      return (
        isVariantAccepted(applicationConfig, authPrincipalVariant.variant) &&
        (!authPrincipalVariant.withAgent ||
          (!isBoolean(applicationConfig) &&
            applicationConfig.withAgent === true))
      );
    }
    default:
      return assertUnreachable(authPrincipalVariant);
  }
};
