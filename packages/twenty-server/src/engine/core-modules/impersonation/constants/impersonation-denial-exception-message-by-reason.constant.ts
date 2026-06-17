import { type ImpersonationDenialReason } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';

export const IMPERSONATION_DENIAL_EXCEPTION_MESSAGE_BY_REASON: Record<
  ImpersonationDenialReason,
  string
> = {
  SERVER_LEVEL_NOT_ALLOWED: 'Server level impersonation not allowed',
  SERVER_LEVEL_2FA_PROVISION_REQUIRED:
    'Two-factor authentication is required for server-level impersonation. Please enable 2FA in your workspace settings before attempting to impersonate users.',
  SERVER_LEVEL_2FA_VERIFICATION_REQUIRED:
    'Two-factor authentication is required for server-level impersonation. Please verify your 2FA method before attempting to impersonate users.',
  WORKSPACE_LEVEL_NOT_ALLOWED: 'Impersonation not allowed',
  TARGET_HAS_ADMIN_PRIVILEGES:
    'Cannot impersonate a user with admin privileges. Only administrators can impersonate other administrators.',
};
