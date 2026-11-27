import { type UserSessionVariant } from 'src/engine/core-modules/auth/types/user-session-variant.type';
import { type ImpersonationLevel } from 'src/engine/core-modules/impersonation/types/impersonation-level.type';

export const USER_SESSION_VARIANT_BY_IMPERSONATION_LEVEL: Record<
  ImpersonationLevel,
  UserSessionVariant
> = {
  server: 'serverImpersonated',
  workspace: 'workspaceImpersonated',
};
