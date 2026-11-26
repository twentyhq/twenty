import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

// Invitations and new members get the workspace default role, which must stay assignable to users
export const assertWorkspaceDefaultRoleStaysAssignableToUsers = ({
  workspaceDefaultRoleId,
  existingFlatRoleMaps,
  toUniversalFlatRoleMaps,
}: {
  workspaceDefaultRoleId: string | null;
  existingFlatRoleMaps: FlatRoleMaps;
  toUniversalFlatRoleMaps: {
    byUniversalIdentifier: Partial<
      Record<string, Pick<UniversalFlatRole, 'canBeAssignedToUsers'>>
    >;
  };
}): void => {
  if (!isDefined(workspaceDefaultRoleId)) {
    return;
  }

  const workspaceDefaultFlatRole = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: workspaceDefaultRoleId,
    flatEntityMaps: existingFlatRoleMaps,
  });

  if (
    !isDefined(workspaceDefaultFlatRole) ||
    !workspaceDefaultFlatRole.canBeAssignedToUsers
  ) {
    return;
  }

  const toUniversalFlatRole =
    toUniversalFlatRoleMaps.byUniversalIdentifier[
      workspaceDefaultFlatRole.universalIdentifier
    ];

  if (
    isDefined(toUniversalFlatRole) &&
    !toUniversalFlatRole.canBeAssignedToUsers
  ) {
    throw new ApplicationException(
      `Role "${workspaceDefaultFlatRole.label}" is the workspace default role, and this application version would stop it from being assigned to members. Set another default role for the workspace first.`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
};
