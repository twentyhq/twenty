import { type ImpersonationDenialReason } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';

export const IMPERSONATION_DENIAL_LOG_MESSAGE_BY_REASON: Record<
  ImpersonationDenialReason,
  (params: { targetUserEmail: string; impersonatorUserId: string }) => string
> = {
  SERVER_LEVEL_NOT_ALLOWED: ({ targetUserEmail, impersonatorUserId }) =>
    `Server level impersonation not allowed for ${targetUserEmail} by userId ${impersonatorUserId}`,
  SERVER_LEVEL_2FA_PROVISION_REQUIRED: ({
    targetUserEmail,
    impersonatorUserId,
  }) =>
    `Server level impersonation denied (2FA provisioning required) for ${targetUserEmail} by userId ${impersonatorUserId}`,
  SERVER_LEVEL_2FA_VERIFICATION_REQUIRED: ({
    targetUserEmail,
    impersonatorUserId,
  }) =>
    `Server level impersonation denied (2FA verification required) for ${targetUserEmail} by userId ${impersonatorUserId}`,
  WORKSPACE_LEVEL_NOT_ALLOWED: ({ targetUserEmail, impersonatorUserId }) =>
    `Impersonation not allowed for ${targetUserEmail} by userId ${impersonatorUserId}`,
  TARGET_HAS_ADMIN_PRIVILEGES: ({ targetUserEmail, impersonatorUserId }) =>
    `Impersonation of admin user ${targetUserEmail} denied for non-admin userId ${impersonatorUserId}`,
};
