import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission, Role } from '~/generated-metadata/graphql';

export const hasPermissionOverride = (
  objectPermission: ObjectPermission,
  settingsDraftRole: Role,
) => {
  const permissionChecks = [
    {
      permission: objectPermission.canReadObjectRecords,
      globalPermission: settingsDraftRole.canReadAllObjectRecords,
    },
    {
      permission: objectPermission.canUpdateObjectRecords,
      globalPermission: settingsDraftRole.canUpdateAllObjectRecords,
    },
    {
      permission: objectPermission.canSoftDeleteObjectRecords,
      globalPermission: settingsDraftRole.canSoftDeleteAllObjectRecords,
    },
    {
      permission: objectPermission.canDestroyObjectRecords,
      globalPermission: settingsDraftRole.canDestroyAllObjectRecords,
    },
  ];

  return permissionChecks.some(
    ({ permission, globalPermission }) =>
      isDefined(permission) && permission !== globalPermission,
  );
};
