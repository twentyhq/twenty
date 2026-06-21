import { type RoleConfig } from '@/sdk/define/roles/role-config';
import { type RoleManifest } from 'twenty-shared/application';
import { v5 as uuidv5 } from 'uuid';

const ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE =
  'b403ec59-4d80-4f22-85e6-717a192dc9cb';

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null';
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const record = value as Record<string, unknown>;

  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
};

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
    rowLevelPermissionPredicateGroups:
      roleConfig.rowLevelPermissionPredicateGroups ?? [],
    rowLevelPermissionPredicates: (
      roleConfig.rowLevelPermissionPredicates ?? []
    ).map((predicate) => ({
      ...predicate,
      universalIdentifier: uuidv5(
        [
          roleConfig.universalIdentifier,
          'rlp',
          predicate.objectUniversalIdentifier,
          predicate.fieldUniversalIdentifier,
          predicate.operand,
          stableStringify(predicate.value ?? null),
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
