import {
  DEFAULT_PERMISSION_CONTEXT_NAME,
  FieldPermissionLevel,
  type LogicFunctionPermissionContext,
  ObjectPermissionLevel,
} from 'twenty-shared/application';

const createEmptyPermissionContext = (): LogicFunctionPermissionContext => ({
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  permissionFlags: {},
  objectsPermissions: {},
});

export type PermissionContext = LogicFunctionPermissionContext & {
  hasObjectPermission: (
    objectUniversalIdentifier: string,
    level: ObjectPermissionLevel,
  ) => boolean;
  hasFieldPermission: (
    objectUniversalIdentifier: string,
    fieldUniversalIdentifier: string,
    level: FieldPermissionLevel,
  ) => boolean;
  hasPermissionFlag: (flagUniversalIdentifier: string) => boolean;
};

const parsePermissionContext = (): LogicFunctionPermissionContext => {
  const raw = process.env[DEFAULT_PERMISSION_CONTEXT_NAME];

  if (!raw) {
    return createEmptyPermissionContext();
  }

  try {
    return JSON.parse(raw) as LogicFunctionPermissionContext;
  } catch {
    return createEmptyPermissionContext();
  }
};

export const getPermissionContext = (): PermissionContext => {
  const context = parsePermissionContext();

  const hasObjectPermission = (
    objectUniversalIdentifier: string,
    level: ObjectPermissionLevel,
  ): boolean => {
    const objectPermissions =
      context.objectsPermissions[objectUniversalIdentifier];

    if (!objectPermissions) {
      return false;
    }

    switch (level) {
      case ObjectPermissionLevel.READ:
        return objectPermissions.canRead;
      case ObjectPermissionLevel.UPDATE:
        return objectPermissions.canUpdate;
      case ObjectPermissionLevel.SOFT_DELETE:
        return objectPermissions.canSoftDelete;
      case ObjectPermissionLevel.DESTROY:
        return objectPermissions.canDestroy;
      default:
        return false;
    }
  };

  const hasFieldPermission = (
    objectUniversalIdentifier: string,
    fieldUniversalIdentifier: string,
    level: FieldPermissionLevel,
  ): boolean => {
    const objectLevel =
      level === FieldPermissionLevel.READ
        ? ObjectPermissionLevel.READ
        : ObjectPermissionLevel.UPDATE;

    if (!hasObjectPermission(objectUniversalIdentifier, objectLevel)) {
      return false;
    }

    const restrictedField =
      context.objectsPermissions[objectUniversalIdentifier]?.restrictedFields[
        fieldUniversalIdentifier
      ];

    if (!restrictedField) {
      return true;
    }

    if (level === FieldPermissionLevel.READ) {
      return restrictedField.canRead !== false;
    }

    return restrictedField.canUpdate !== false;
  };

  const hasPermissionFlag = (flagUniversalIdentifier: string): boolean =>
    context.permissionFlags[flagUniversalIdentifier] === true;

  return {
    ...context,
    hasObjectPermission,
    hasFieldPermission,
    hasPermissionFlag,
  };
};
