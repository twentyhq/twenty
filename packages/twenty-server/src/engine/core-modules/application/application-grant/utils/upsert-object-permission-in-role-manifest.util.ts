import {
  type ObjectPermissionAction,
  type ObjectPermissionManifest,
  type RoleManifest,
} from 'twenty-shared/application';

export const upsertObjectPermissionInRoleManifest = ({
  roleManifest,
  objectUniversalIdentifier,
  action,
  value,
}: {
  roleManifest: RoleManifest;
  objectUniversalIdentifier: string;
  action: ObjectPermissionAction;
  value: boolean | null;
}): RoleManifest => {
  const objectPermissions = roleManifest.objectPermissions ?? [];
  const hasRow = objectPermissions.some(
    (objectPermission) =>
      objectPermission.objectUniversalIdentifier === objectUniversalIdentifier,
  );

  const nextObjectPermissions: ObjectPermissionManifest[] = hasRow
    ? objectPermissions.map((objectPermission) =>
        objectPermission.objectUniversalIdentifier === objectUniversalIdentifier
          ? { ...objectPermission, [action]: value ?? undefined }
          : objectPermission,
      )
    : [
        ...objectPermissions,
        { objectUniversalIdentifier, [action]: value ?? undefined },
      ];

  return { ...roleManifest, objectPermissions: nextObjectPermissions };
};
