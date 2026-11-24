import { isDefined } from 'twenty-shared/utils';
import { type FieldPermission } from '~/generated-metadata/graphql';

export const filterFieldPermissionsOfPredicateGroups = ({
  fieldPermissions,
  predicateGroups,
}: {
  fieldPermissions: FieldPermission[];
  predicateGroups: { id: string }[];
}): FieldPermission[] => {
  const predicateGroupIds = new Set(predicateGroups.map(({ id }) => id));

  return fieldPermissions.filter(
    ({ rowLevelPermissionPredicateGroupId }) =>
      isDefined(rowLevelPermissionPredicateGroupId) &&
      predicateGroupIds.has(rowLevelPermissionPredicateGroupId),
  );
};
