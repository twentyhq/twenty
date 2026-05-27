import { defineLogicFunction } from 'twenty-sdk/define';
import {
  FieldPermissionLevel,
  getPermissionContext,
  ObjectPermissionLevel,
  type RoutePayload,
} from 'twenty-sdk/logic-function';

type PermissionContextDemoBody = {
  objectUniversalIdentifier?: string;
  fieldUniversalIdentifier?: string;
  permissionFlagUniversalIdentifier?: string;
};

export const main = async (
  params: RoutePayload<PermissionContextDemoBody>,
): Promise<object> => {
  const {
    objectUniversalIdentifier,
    fieldUniversalIdentifier,
    permissionFlagUniversalIdentifier,
  } = params.body || {};

  const permissions = getPermissionContext();

  return {
    canReadAllObjectRecords: permissions.canReadAllObjectRecords,
    canUpdateAllObjectRecords: permissions.canUpdateAllObjectRecords,
    canAccessAllTools: permissions.canAccessAllTools,
    canUpdateAllSettings: permissions.canUpdateAllSettings,
    canReadObject: objectUniversalIdentifier
      ? permissions.hasObjectPermission(
          objectUniversalIdentifier,
          ObjectPermissionLevel.READ,
        )
      : null,
    canUpdateObject: objectUniversalIdentifier
      ? permissions.hasObjectPermission(
          objectUniversalIdentifier,
          ObjectPermissionLevel.UPDATE,
        )
      : null,
    canReadField:
      objectUniversalIdentifier && fieldUniversalIdentifier
        ? permissions.hasFieldPermission(
            objectUniversalIdentifier,
            fieldUniversalIdentifier,
            FieldPermissionLevel.READ,
          )
        : null,
    hasPermissionFlag: permissionFlagUniversalIdentifier
      ? permissions.hasPermissionFlag(permissionFlagUniversalIdentifier)
      : null,
  };
};

export default defineLogicFunction({
  universalIdentifier: '0ef6d1e4-1a89-4b30-9c43-703fec036c89',
  name: 'permission-context-demo',
  timeoutSeconds: 10,
  handler: main,
  httpRouteTriggerSettings: {
    path: '/webhook/permission-context-demo',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
