import { type RoleConfig } from '@/sdk/define/roles/role-config';
import { type RoleManifest } from 'twenty-shared/application';
import { v5 as uuidv5 } from 'uuid';

const ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE =
  'b403ec59-4d80-4f22-85e6-717a192dc9cb';

export const fromRoleConfigToRoleManifest = (
  roleConfig: RoleConfig,
): RoleManifest => {
  return {
    ...roleConfig,
    objectPermissions: (roleConfig.objectPermissions ?? []).map(
      (objectPermission) => ({
        ...objectPermission,
        universalIdentifier: uuidv5(
          `${roleConfig.universalIdentifier}:${objectPermission.objectUniversalIdentifier}`,
          ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
        ),
      }),
    ),
    fieldPermissions: (roleConfig.fieldPermissions ?? []).map(
      (fieldPermission) => ({
        ...fieldPermission,
        universalIdentifier: uuidv5(
          `${roleConfig.universalIdentifier}:${fieldPermission.objectUniversalIdentifier}:${fieldPermission.fieldUniversalIdentifier}`,
          ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
        ),
      }),
    ),
    // Predicate groups keep their author-provided universalIdentifier (predicates reference
    // them by it). Predicate universalIdentifiers are derived from their semantic content so
    // they stay stable across rebuilds without the author having to manage uuids.
    rowLevelPermissionPredicateGroups:
      roleConfig.rowLevelPermissionPredicateGroups ?? [],
    rowLevelPermissionPredicates: (
      roleConfig.rowLevelPermissionPredicates ?? []
    ).map((predicate) => ({
      ...predicate,
      universalIdentifier: uuidv5(
        // Every field that distinguishes two predicates must be in the key, otherwise
        // semantically different predicates would derive the same universalIdentifier and
        // collide when added to the flat entity maps at sync time.
        [
          roleConfig.universalIdentifier,
          'rlp',
          predicate.objectUniversalIdentifier,
          predicate.fieldUniversalIdentifier,
          predicate.operand,
          JSON.stringify(predicate.value ?? null),
          predicate.subFieldName ?? '',
          predicate.workspaceMemberFieldUniversalIdentifier ?? '',
          predicate.workspaceMemberSubFieldName ?? '',
          predicate.predicateGroupUniversalIdentifier ?? '',
          predicate.position ?? '',
        ].join(':'),
        ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
      ),
    })),
    permissionFlagUniversalIdentifiers:
      roleConfig.permissionFlagUniversalIdentifiers ?? [],
  };
};
