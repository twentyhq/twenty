import {
  OBJECT_PERMISSION_ACTIONS,
  type ObjectPermissionAction,
} from 'twenty-shared/application';

export const getLockedActionsByObjectMetadataId = (
  lockedObjectPermissions: ({
    objectMetadataId: string;
  } & Partial<Record<ObjectPermissionAction, boolean | null>>)[],
): Map<string, ObjectPermissionAction[]> =>
  new Map(
    lockedObjectPermissions.map((lockedObjectPermission) => [
      lockedObjectPermission.objectMetadataId,
      OBJECT_PERMISSION_ACTIONS.filter(
        (action) => lockedObjectPermission[action] === true,
      ),
    ]),
  );
