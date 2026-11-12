import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import { getDirtyFields } from '~/utils/getDirtyFields';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const byId = (first: { id: string }, second: { id: string }) =>
  first.id.localeCompare(second.id);

// The server derives rules and their ids, and syncing a rule edit reorders these lists
const withoutServerDerivedRuleFields = (
  role: RoleWithPartialMembers,
): RoleWithPartialMembers => ({
  ...role,
  rowLevelPermissionRules: undefined,
  rowLevelPermissionPredicates: role.rowLevelPermissionPredicates
    ?.map(({ rowLevelPermissionRuleId: _ruleId, ...predicate }) => ({
      ...predicate,
      relationFieldMetadataId: predicate.relationFieldMetadataId ?? null,
    }))
    .sort(byId),
  rowLevelPermissionPredicateGroups: role.rowLevelPermissionPredicateGroups
    ?.map(
      ({ rowLevelPermissionRuleId: _ruleId, ...predicateGroup }) =>
        predicateGroup,
    )
    .sort(byId),
});

export const getRoleDirtyFields = (
  draftRole: RoleWithPartialMembers,
  persistedRole: RoleWithPartialMembers | undefined,
): Partial<RoleWithPartialMembers> => {
  const dirtyFields = getDirtyFields(
    withoutServerDerivedRuleFields(draftRole),
    isDefined(persistedRole)
      ? withoutServerDerivedRuleFields(persistedRole)
      : undefined,
  );

  if (
    isDefined(persistedRole) &&
    isDeeplyEqual(
      draftRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
      persistedRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
    )
  ) {
    const { permissionFlags: _permissionFlags, ...otherDirtyFields } =
      dirtyFields;

    return otherDirtyFields;
  }

  return dirtyFields;
};
