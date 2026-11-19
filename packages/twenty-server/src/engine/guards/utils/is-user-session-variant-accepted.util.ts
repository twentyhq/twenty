import { isBoolean } from '@sniptt/guards';
import { assertUnreachable } from 'twenty-shared/utils';

import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';

export const isUserSessionVariantAccepted = ({
  userSessionGuardConfig,
  userSessionVariant,
}: {
  userSessionGuardConfig: AuthPrincipalGuardConfig['userSession'];
  userSessionVariant: Extract<
    AuthPrincipalVariant,
    { kind: 'userSession' }
  >['variant'];
}): boolean => {
  if (isBoolean(userSessionGuardConfig)) {
    return userSessionGuardConfig;
  }

  const { impersonated } = userSessionGuardConfig;

  switch (userSessionVariant) {
    case 'serverImpersonated':
      return isBoolean(impersonated) ? impersonated : impersonated.server;
    case 'workspaceImpersonated':
      return isBoolean(impersonated) ? impersonated : impersonated.workspace;
    case 'standard':
    case 'playground':
    case 'workspaceAgnostic':
      return userSessionGuardConfig[userSessionVariant];
    default:
      return assertUnreachable(userSessionVariant);
  }
};
