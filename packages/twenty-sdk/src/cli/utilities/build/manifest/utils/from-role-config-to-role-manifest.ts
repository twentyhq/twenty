import { type RoleConfig } from '@/sdk/define/roles/role-config';
import { type RoleManifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { v5 as uuidv5 } from 'uuid';

const ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE =
  'b403ec59-4d80-4f22-85e6-717a192dc9cb';

const generateRoleChildUniversalIdentifier = (parts: string[]): string =>
  uuidv5(parts.join(':'), ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE);

export const fromRoleConfigToRoleManifest = (
  roleConfig: RoleConfig,
): RoleManifest => {
  const {
    fieldPermissions,
    objectPermissions,
    permissionFlags,
    rowLevelPermissionPredicateGroups,
    rowLevelPermissionPredicates,
    ...roleManifestConfig
  } = roleConfig;
  const roleUniversalIdentifier = roleConfig.universalIdentifier;

  return {
    ...roleManifestConfig,
    objectPermissions: (objectPermissions ?? []).map(
      (objectPermission) => ({
        ...objectPermission,
        universalIdentifier: generateRoleChildUniversalIdentifier([
          roleUniversalIdentifier,
          objectPermission.objectUniversalIdentifier,
        ]),
      }),
    ),
    fieldPermissions: (fieldPermissions ?? []).map(
      (fieldPermission) => ({
        ...fieldPermission,
        universalIdentifier: generateRoleChildUniversalIdentifier([
          roleUniversalIdentifier,
          fieldPermission.objectUniversalIdentifier,
          fieldPermission.fieldUniversalIdentifier,
        ]),
      }),
    ),
    permissionFlagUniversalIdentifiers:
      roleConfig.permissionFlagUniversalIdentifiers ??
      permissionFlags?.map(
        (permissionFlag) => SystemPermissionFlag[permissionFlag],
      ) ??
      [],
    rowLevelPermissionPredicateGroups: (
      rowLevelPermissionPredicateGroups ?? []
    ).map((predicateGroup) => ({
      ...predicateGroup,
      universalIdentifier:
        predicateGroup.universalIdentifier ??
        generateRoleChildUniversalIdentifier([
          roleUniversalIdentifier,
          'row-level-permission-predicate-group',
          predicateGroup.objectUniversalIdentifier,
          predicateGroup.logicalOperator,
          predicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier ??
            '',
          String(
            predicateGroup.positionInRowLevelPermissionPredicateGroup ?? '',
          ),
        ]),
    })),
    rowLevelPermissionPredicates: (rowLevelPermissionPredicates ?? []).map(
      (predicate) => ({
      ...predicate,
      universalIdentifier:
        predicate.universalIdentifier ??
        generateRoleChildUniversalIdentifier([
          roleUniversalIdentifier,
          'row-level-permission-predicate',
          predicate.objectUniversalIdentifier,
          predicate.fieldUniversalIdentifier,
          predicate.operand,
          JSON.stringify(predicate.value ?? null),
          predicate.subFieldName ?? '',
          predicate.workspaceMemberFieldUniversalIdentifier ?? '',
          predicate.workspaceMemberSubFieldName ?? '',
          predicate.rowLevelPermissionPredicateGroupUniversalIdentifier ?? '',
          String(predicate.positionInRowLevelPermissionPredicateGroup ?? ''),
        ]),
      }),
    ),
  };
};
