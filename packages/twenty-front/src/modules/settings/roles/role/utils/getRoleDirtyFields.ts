import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import { getDirtyFields } from '~/utils/getDirtyFields';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const getRoleDirtyFields = (
  draftRole: RoleWithPartialMembers,
  persistedRole: RoleWithPartialMembers | undefined,
): Partial<RoleWithPartialMembers> => {
  const dirtyFields = getDirtyFields(draftRole, persistedRole);

  if (
    isDefined(persistedRole) &&
    isDeeplyEqual(
      draftRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
      persistedRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
    )
  ) {
    delete dirtyFields.permissionFlags;
  }

  return dirtyFields;
};
