import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { type ImpersonationDenialReason } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';

type ImpersonationDenial = {
  message: string;
  exceptionCode: (typeof AuthExceptionCode)[keyof typeof AuthExceptionCode];
  userFriendlyMessage: MessageDescriptor;
};

export const IMPERSONATION_DENIAL_BY_REASON: Record<
  ImpersonationDenialReason,
  ImpersonationDenial
> = {
  SERVER_LEVEL_NOT_ALLOWED: {
    message: 'Server level impersonation not allowed',
    exceptionCode: AuthExceptionCode.FORBIDDEN_EXCEPTION,
    userFriendlyMessage: msg`Server-level impersonation is not enabled for this user or workspace.`,
  },
  SERVER_LEVEL_2FA_PROVISION_REQUIRED: {
    message:
      'Two-factor authentication is required for server-level impersonation. Please enable 2FA in your workspace settings before attempting to impersonate users.',
    exceptionCode: AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED,
    userFriendlyMessage: msg`Set up two-factor authentication before impersonating users in another workspace.`,
  },
  SERVER_LEVEL_2FA_VERIFICATION_REQUIRED: {
    message:
      'Two-factor authentication is required for server-level impersonation. Please verify your 2FA method before attempting to impersonate users.',
    exceptionCode:
      AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED,
    userFriendlyMessage: msg`Verify your two-factor authentication before impersonating users in another workspace.`,
  },
  WORKSPACE_LEVEL_NOT_ALLOWED: {
    message: 'Impersonation not allowed',
    exceptionCode: AuthExceptionCode.FORBIDDEN_EXCEPTION,
    userFriendlyMessage: msg`You do not have permission to impersonate users in this workspace.`,
  },
  TARGET_HAS_ADMIN_PRIVILEGES: {
    message:
      'Cannot impersonate a user with admin privileges. Only administrators can impersonate other administrators.',
    exceptionCode: AuthExceptionCode.FORBIDDEN_EXCEPTION,
    userFriendlyMessage: msg`Only administrators can impersonate users with admin privileges.`,
  },
};
