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

const keepDefinedValues = <TValue extends Record<string, unknown>>(
  value: TValue,
): { [TKey in keyof TValue]?: NonNullable<TValue[TKey]> } =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => isDefined(entryValue)),
  ) as { [TKey in keyof TValue]?: NonNullable<TValue[TKey]> };

const keepTrueValues = <TValue extends Record<string, boolean>>(
  value: TValue,
): Partial<TValue> =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue),
  ) as Partial<TValue>;

// Tools only ever reached the objects a step agent's role granted row by row, whatever its
// all-records flags, and a scope's all-records flags would name every object, so they stay out
export const buildAiRunScopeFromStepAgentRole = (
  role: StepAgentRole,
): AiRunScope => {
  const objectPermissions = role.objectPermissions
    .map(({ objectUniversalIdentifier, ...actions }) => ({
      objectUniversalIdentifier,
      ...keepDefinedValues(actions),
    }))
    .filter((objectPermission) => Object.keys(objectPermission).length > 1);
  const fieldPermissions = role.fieldPermissions
    .map(({ objectUniversalIdentifier, fieldUniversalIdentifier, ...actions }) => ({
      objectUniversalIdentifier,
      fieldUniversalIdentifier,
      ...keepDefinedValues(actions),
    }))
    .filter((fieldPermission) => Object.keys(fieldPermission).length > 2);

  return {
    ...keepTrueValues({
      canUpdateAllSettings: role.canUpdateAllSettings,
      canAccessAllTools: role.canAccessAllTools,
    }),
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
