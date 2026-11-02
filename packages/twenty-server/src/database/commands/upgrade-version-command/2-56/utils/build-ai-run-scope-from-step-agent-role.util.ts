import {
  type AiRunScope,
  type AiRunScopeFieldPermission,
  type AiRunScopeObjectPermission,
} from 'twenty-shared/ai';
import { type RolePermissionGrants } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

// a permission column is null where a grant leaves its key out
type StoredPermissionRow<TGrant> = {
  [Key in keyof TGrant]-?: undefined extends TGrant[Key]
    ? Exclude<TGrant[Key], undefined> | null
    : TGrant[Key];
};

export type StoredObjectPermissionRow =
  StoredPermissionRow<AiRunScopeObjectPermission>;

export type StoredFieldPermissionRow =
  StoredPermissionRow<AiRunScopeFieldPermission>;

const toScopeObjectPermission = ({
  objectUniversalIdentifier,
  canReadObjectRecords,
  canUpdateObjectRecords,
  canSoftDeleteObjectRecords,
  canDestroyObjectRecords,
}: StoredObjectPermissionRow): AiRunScopeObjectPermission => ({
  objectUniversalIdentifier,
  ...(isDefined(canReadObjectRecords) ? { canReadObjectRecords } : {}),
  ...(isDefined(canUpdateObjectRecords) ? { canUpdateObjectRecords } : {}),
  ...(isDefined(canSoftDeleteObjectRecords)
    ? { canSoftDeleteObjectRecords }
    : {}),
  ...(isDefined(canDestroyObjectRecords) ? { canDestroyObjectRecords } : {}),
});

const toScopeFieldPermission = ({
  objectUniversalIdentifier,
  fieldUniversalIdentifier,
  canReadFieldValue,
  canUpdateFieldValue,
}: StoredFieldPermissionRow): AiRunScopeFieldPermission => ({
  objectUniversalIdentifier,
  fieldUniversalIdentifier,
  ...(isDefined(canReadFieldValue) ? { canReadFieldValue } : {}),
  ...(isDefined(canUpdateFieldValue) ? { canUpdateFieldValue } : {}),
});

// all-records flags stay out: tools only reached the objects the role granted row by row
export const buildAiRunScopeFromStepAgentRole = (
  role: Pick<
    RolePermissionGrants,
    | 'canUpdateAllSettings'
    | 'canAccessAllTools'
    | 'permissionFlagUniversalIdentifiers'
  > & {
    objectPermissions: StoredObjectPermissionRow[];
    fieldPermissions: StoredFieldPermissionRow[];
  },
): AiRunScope => {
  const objectPermissions = role.objectPermissions
    .map(toScopeObjectPermission)
    .filter((objectPermission) => Object.keys(objectPermission).length > 1);
  const fieldPermissions = role.fieldPermissions
    .map(toScopeFieldPermission)
    .filter((fieldPermission) => Object.keys(fieldPermission).length > 2);

  return {
    ...(role.canUpdateAllSettings ? { canUpdateAllSettings: true } : {}),
    ...(role.canAccessAllTools ? { canAccessAllTools: true } : {}),
    ...(isNonEmptyArray(objectPermissions) ? { objectPermissions } : {}),
    ...(isNonEmptyArray(fieldPermissions) ? { fieldPermissions } : {}),
    ...(isNonEmptyArray(role.permissionFlagUniversalIdentifiers)
      ? {
          permissionFlagUniversalIdentifiers: [
            ...role.permissionFlagUniversalIdentifiers,
          ].sort(),
        }
      : {}),
  };
};
