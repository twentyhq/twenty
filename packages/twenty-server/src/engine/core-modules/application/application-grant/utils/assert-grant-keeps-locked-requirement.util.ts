import {
  computeGrantMissingLockedPermissions,
  type RoleManifest,
} from 'twenty-shared/application';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const assertGrantKeepsLockedRequirement = ({
  approvedRoleManifest,
  grantRoleManifest,
}: {
  approvedRoleManifest: RoleManifest;
  grantRoleManifest: RoleManifest;
}): void => {
  const missingLockedPermissions = computeGrantMissingLockedPermissions({
    approvedRoleManifest,
    grantRoleManifest,
  });

  if (missingLockedPermissions.length > 0) {
    throw new ApplicationException(
      `The grant must keep what the application requires: ${missingLockedPermissions
        .map((grant) => JSON.stringify(grant))
        .join(', ')}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
};
