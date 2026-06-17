import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { type ImpersonationDenialReason } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';

export const IMPERSONATION_DENIAL_EXCEPTION_CODE_BY_REASON: Record<
  ImpersonationDenialReason,
  (typeof AuthExceptionCode)[keyof typeof AuthExceptionCode]
> = {
  SERVER_LEVEL_NOT_ALLOWED: AuthExceptionCode.FORBIDDEN_EXCEPTION,
  SERVER_LEVEL_2FA_REQUIRED:
    AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED,
  WORKSPACE_LEVEL_NOT_ALLOWED: AuthExceptionCode.FORBIDDEN_EXCEPTION,
  TARGET_HAS_ADMIN_PRIVILEGES: AuthExceptionCode.FORBIDDEN_EXCEPTION,
};
