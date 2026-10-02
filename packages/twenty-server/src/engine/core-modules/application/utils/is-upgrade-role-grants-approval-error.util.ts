import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const isUpgradeRoleGrantsApprovalError = (
  error: unknown,
): error is ApplicationException =>
  error instanceof ApplicationException &&
  error.code === ApplicationExceptionCode.UPGRADE_REQUIRES_ROLE_GRANTS_APPROVAL;
