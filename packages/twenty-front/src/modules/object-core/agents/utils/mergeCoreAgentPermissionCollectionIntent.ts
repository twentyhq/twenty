export const mergeCoreAgentPermissionCollectionIntent = <
  TPermission extends object,
  TKey extends keyof TPermission,
>({
  assignedPermissions,
  draftPermissions,
  submittedPermissions,
  uniqueKey,
  isEdited,
}: {
  assignedPermissions: TPermission[];
  draftPermissions: TPermission[];
  submittedPermissions: TPermission[];
  uniqueKey: TKey;
  isEdited: boolean;
}): TPermission[] => {
  if (!isEdited) {
    return assignedPermissions;
  }

  const nextPermissions = new Map(
    assignedPermissions.map((permission) => [
      permission[uniqueKey],
      permission,
    ]),
  );
  const draftPermissionsByKey = new Map(
    draftPermissions.map((permission) => [permission[uniqueKey], permission]),
  );

  for (const permission of submittedPermissions) {
    if (!draftPermissionsByKey.has(permission[uniqueKey])) {
      nextPermissions.delete(permission[uniqueKey]);
    }
  }

  for (const [key, permission] of draftPermissionsByKey) {
    nextPermissions.set(key, permission);
  }

  return [...nextPermissions.values()];
};
