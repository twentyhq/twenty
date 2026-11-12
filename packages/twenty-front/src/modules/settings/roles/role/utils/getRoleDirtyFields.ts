import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';
import { getDirtyFields } from '~/utils/getDirtyFields';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const sortById = <TItem extends { id: string }>(
  items: TItem[] | null | undefined,
) => (items ?? []).toSorted(sortByProperty('id'));

export const getRoleDirtyFields = (
  draftRole: RoleWithPartialMembers,
  persistedRole: RoleWithPartialMembers | undefined,
): Partial<RoleWithPartialMembers> => {
  const dirtyFields = getDirtyFields(draftRole, persistedRole);

  if (!isDefined(persistedRole)) {
    return dirtyFields;
  }

  const isSameByKey: Record<string, boolean> = {
    permissionFlags: isDeeplyEqual(
      draftRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
      persistedRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
    ),
    rowLevelPermissionPredicates: isDeeplyEqual(
      sortById(draftRole.rowLevelPermissionPredicates),
      sortById(persistedRole.rowLevelPermissionPredicates),
    ),
    rowLevelPermissionPredicateGroups: isDeeplyEqual(
      sortById(draftRole.rowLevelPermissionPredicateGroups),
      sortById(persistedRole.rowLevelPermissionPredicateGroups),
    ),
  };

  return Object.fromEntries(
    Object.entries(dirtyFields).filter(([key]) => !isSameByKey[key]),
  );
};
