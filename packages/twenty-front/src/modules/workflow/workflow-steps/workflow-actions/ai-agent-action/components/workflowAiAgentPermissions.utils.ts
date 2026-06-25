import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export type FilteredPermissionsResult<T> = {
  filteredPermissions: T[];
  filteredEnabledPermissions: T[];
};

export const getFilteredPermissions = <
  T extends { key: string; name: string },
>({
  permissions,
  permissionFlagKeys,
  searchQuery,
}: {
  permissions: T[];
  permissionFlagKeys: string[];
  searchQuery: string;
}): FilteredPermissionsResult<T> => {
  const filteredPermissions = filterBySearchQuery<T>({
    items: permissions,
    searchQuery,
    getSearchableValues: (permission) => [permission.name],
  });

  const enabledPermissions = permissions.filter((permission) =>
    permissionFlagKeys.includes(permission.key),
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
