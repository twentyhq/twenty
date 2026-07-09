import { type VersionValidationFailureReason } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationRegistrationExceptionCode } from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';

export const VERSION_REASON_TO_APPLICATION_EXCEPTION_CODE: Record<
  VersionValidationFailureReason,
  ApplicationExceptionCode
> = {
  INVALID_REQUIRED_VERSION:
    ApplicationExceptionCode.INVALID_APP_ENGINE_REQUIREMENT,
  INVALID_SERVER_VERSION: ApplicationExceptionCode.INVALID_SERVER_VERSION,
  INVALID_WORKSPACE_VERSION: ApplicationExceptionCode.INVALID_WORKSPACE_VERSION,
  INSTANCE_INCOMPATIBLE: ApplicationExceptionCode.SERVER_VERSION_INCOMPATIBLE,
  WORKSPACE_INCOMPATIBLE:
    ApplicationExceptionCode.WORKSPACE_VERSION_INCOMPATIBLE,
};

// The registration flow (tarball upload) has no per-workspace context, so
// workspace-scoped reasons collapse onto the server-scoped registration codes.
export const VERSION_REASON_TO_APPLICATION_REGISTRATION_EXCEPTION_CODE: Record<
  VersionValidationFailureReason,
  ApplicationRegistrationExceptionCode
> = {
  INVALID_REQUIRED_VERSION:
    ApplicationRegistrationExceptionCode.INVALID_APP_ENGINE_REQUIREMENT,
  INVALID_SERVER_VERSION:
    ApplicationRegistrationExceptionCode.INVALID_SERVER_VERSION,
  INVALID_WORKSPACE_VERSION:
    ApplicationRegistrationExceptionCode.INVALID_SERVER_VERSION,
  INSTANCE_INCOMPATIBLE:
    ApplicationRegistrationExceptionCode.SERVER_VERSION_INCOMPATIBLE,
  WORKSPACE_INCOMPATIBLE:
    ApplicationRegistrationExceptionCode.SERVER_VERSION_INCOMPATIBLE,
};
