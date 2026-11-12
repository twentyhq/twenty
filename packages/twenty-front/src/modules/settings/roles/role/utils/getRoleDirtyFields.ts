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
  rowLevelPermissionFieldPermissions: undefined,
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

// Draft field permissions carry temporary ids and cleared entries the server does not return
const getFieldRestrictionKeys = (role: RoleWithPartialMembers) =>
  (role.fieldPermissions ?? [])
    .filter(
      ({ canReadFieldValue, canUpdateFieldValue }) =>
        canReadFieldValue === false || canUpdateFieldValue === false,
    )
    .map(
      (fieldPermission) =>
        `${fieldPermission.fieldMetadataId}:${fieldPermission.rowLevelPermissionPredicateGroupId ?? ''}:${fieldPermission.canReadFieldValue === false}:${fieldPermission.canUpdateFieldValue === false}`,
    )
    .sort();

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

  if (!isDefined(persistedRole)) {
    return dirtyFields;
  }

  const hasSamePermissionFlags = isDeeplyEqual(
    draftRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
    persistedRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
  );
  const hasSameFieldRestrictions = isDeeplyEqual(
    getFieldRestrictionKeys(draftRole),
    getFieldRestrictionKeys(persistedRole),
  );

  return Object.fromEntries(
    Object.entries(dirtyFields).filter(
      ([key]) =>
        !(key === 'permissionFlags' && hasSamePermissionFlags) &&
        !(key === 'fieldPermissions' && hasSameFieldRestrictions),
    ),
  );
};
