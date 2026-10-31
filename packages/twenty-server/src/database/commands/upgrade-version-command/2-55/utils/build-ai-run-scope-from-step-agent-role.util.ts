import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export type StepAgentRoleObjectPermission = {
  objectUniversalIdentifier: string;
  canReadObjectRecords: boolean | null;
  canUpdateObjectRecords: boolean | null;
  canSoftDeleteObjectRecords: boolean | null;
  canDestroyObjectRecords: boolean | null;
};

export type StepAgentRoleFieldPermission = {
  objectUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  canReadFieldValue: boolean | null;
  canUpdateFieldValue: boolean | null;
};

export type StepAgentRole = {
  canReadAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  canUpdateAllSettings: boolean;
  canAccessAllTools: boolean;
  objectPermissions: StepAgentRoleObjectPermission[];
  fieldPermissions: StepAgentRoleFieldPermission[];
  permissionFlagUniversalIdentifiers: string[];
};

const toScopeObjectPermission = ({
  objectUniversalIdentifier,
  canReadObjectRecords,
  canUpdateObjectRecords,
  canSoftDeleteObjectRecords,
  canDestroyObjectRecords,
}: StepAgentRoleObjectPermission) => ({
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
}: StepAgentRoleFieldPermission) => ({
  objectUniversalIdentifier,
  fieldUniversalIdentifier,
  ...(isDefined(canReadFieldValue) ? { canReadFieldValue } : {}),
  ...(isDefined(canUpdateFieldValue) ? { canUpdateFieldValue } : {}),
});

// all-records flags stay out: tools only reached the objects the role granted row by row
export const buildAiRunScopeFromStepAgentRole = (
  role: Pick<
    StepAgentRole,
    | 'canUpdateAllSettings'
    | 'canAccessAllTools'
    | 'objectPermissions'
    | 'fieldPermissions'
    | 'permissionFlagUniversalIdentifiers'
  >,
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
    ...(objectPermissions.length > 0 ? { objectPermissions } : {}),
    ...(fieldPermissions.length > 0 ? { fieldPermissions } : {}),
    ...(role.permissionFlagUniversalIdentifiers.length > 0
      ? {
          permissionFlagUniversalIdentifiers: [
            ...role.permissionFlagUniversalIdentifiers,
          ].sort(),
        }
      : {}),
  };
};
