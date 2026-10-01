/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { canRolesAccessAllRecords } from 'src/engine/core-modules/record-share/utils/can-roles-access-all-records.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';

export const buildRoleRowAccessPolicySubject = ({
  roleId,
  owningApplicationId,
  rolesPermissions,
  roleIdsWithAllRecordsAccess,
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
  flatFieldMetadataMaps,
  workspaceMember,
}: {
  roleId: string | undefined;
  owningApplicationId: string | undefined;
  rolesPermissions: ObjectsPermissionsByRoleId;
  roleIdsWithAllRecordsAccess: string[];
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  workspaceMember?: UserWorkspaceAuthContext['workspaceMember'];
}): RowAccessPolicySubject => {
  const roleIds = isDefined(roleId) ? [roleId] : [];

  return {
    isSystemContext: false,
    objectsPermissions: isDefined(roleId)
      ? rolesPermissions[roleId]
      : undefined,
    principalIds: [EVERYONE_PRINCIPAL_ID, ...roleIds],
    canAccessAllRecords: canRolesAccessAllRecords({
      roleIds,
      roleIdsWithAllRecordsAccess,
    }),
    isOwningApplication: (objectMetadata) =>
      isDefined(owningApplicationId) &&
      objectMetadata.applicationId === owningApplicationId,
    resolveRowLevelPermissionRecordFilter: (objectMetadata) => {
      if (roleIds.length === 0) {
        return null;
      }

      const recordFilter = buildRowLevelPermissionRecordFilter({
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        flatFieldMetadataMaps,
        objectMetadata,
        roleIds,
        workspaceMember,
      });

      return isDefined(recordFilter) && Object.keys(recordFilter).length > 0
        ? recordFilter
        : null;
    },
  };
};
