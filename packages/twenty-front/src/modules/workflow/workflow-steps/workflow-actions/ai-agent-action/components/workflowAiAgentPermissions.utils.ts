import type { PermissionFlagType } from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export type FilteredPermissionsResult<T> = {
  filteredPermissions: T[];
  filteredEnabledPermissions: T[];
};

export const getFilteredPermissions = <
  T extends { key: PermissionFlagType; name: string },
>({
  permissions,
  permissionFlagGrantKeys,
  searchQuery,
}: {
  permissions: T[];
  permissionFlagGrantKeys: PermissionFlagType[];
  searchQuery: string;
}): FilteredPermissionsResult<T> => {
  const filteredPermissions = filterBySearchQuery<T>({
    items: permissions,
    searchQuery,
    getSearchableValues: (permission) => [permission.name],
  });

  const enabledPermissions = permissions.filter((permission) =>
    permissionFlagGrantKeys.includes(permission.key),
  );

  const filteredEnabledPermissions = filterBySearchQuery<T>({
    items: enabledPermissions,
    searchQuery,
    getSearchableValues: (permission) => [permission.name],
  });

  return {
    filteredPermissions,
    filteredEnabledPermissions,
  };
};
