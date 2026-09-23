import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import { getDirtyFields } from '~/utils/getDirtyFields';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const reconcileCollection = <
  TItem extends Record<string, unknown>,
  TSaved extends TItem[] | null | undefined,
>(
  saved: TSaved,
  baseline: TItem[] | null | undefined,
  draft: TItem[] | null | undefined,
  getIdentity: (item: TItem) => string,
): TSaved | TItem[] => {
  if (isDeeplyEqual(draft, baseline)) {
    return saved;
  }

  const baselineByIdentity = new Map(
    baseline?.map((item) => [getIdentity(item), item]),
  );
  const draftByIdentity = new Map(
    draft?.map((item) => [getIdentity(item), item]),
  );
  const savedIdentities = new Set(saved?.map(getIdentity));

  const merged = (saved ?? []).flatMap((savedItem) => {
    const identity = getIdentity(savedItem);
    const baselineItem = baselineByIdentity.get(identity);
    const draftItem = draftByIdentity.get(identity);

    if (!isDefined(draftItem)) {
      return isDefined(baselineItem) ? [] : [savedItem];
    }

    const changes = getDirtyFields(draftItem, baselineItem);
    delete changes.id;
    delete changes.__typename;

    return [{ ...savedItem, ...changes }];
  });

  return [
    ...merged,
    ...(draft ?? []).filter((item) => {
      const identity = getIdentity(item);

      return (
        !savedIdentities.has(identity) &&
        Object.keys(getDirtyFields(item, baselineByIdentity.get(identity)))
          .length > 0
      );
    }),
  ];
};

export const reconcileRoleDraft = ({
  savedRole,
  baselineRole,
  draftRole,
}: {
  savedRole: RoleWithPartialMembers;
  baselineRole: RoleWithPartialMembers;
  draftRole: RoleWithPartialMembers;
}): RoleWithPartialMembers => ({
  ...savedRole,
  ...getDirtyFields(draftRole, baselineRole),
  permissionFlags: reconcileCollection(
    savedRole.permissionFlags,
    baselineRole.permissionFlags,
    draftRole.permissionFlags,
    (permission) => permission.flag,
  ),
  objectPermissions: reconcileCollection(
    savedRole.objectPermissions,
    baselineRole.objectPermissions,
    draftRole.objectPermissions,
    (permission) => permission.objectMetadataId,
  ),
  fieldPermissions: reconcileCollection(
    savedRole.fieldPermissions,
    baselineRole.fieldPermissions,
    draftRole.fieldPermissions,
    (permission) => permission.fieldMetadataId,
  ),
  rowLevelPermissionPredicates: reconcileCollection(
    savedRole.rowLevelPermissionPredicates,
    baselineRole.rowLevelPermissionPredicates,
    draftRole.rowLevelPermissionPredicates,
    (predicate) => predicate.id,
  ),
  rowLevelPermissionPredicateGroups: reconcileCollection(
    savedRole.rowLevelPermissionPredicateGroups,
    baselineRole.rowLevelPermissionPredicateGroups,
    draftRole.rowLevelPermissionPredicateGroups,
    (group) => group.id,
  ),
  workspaceMembers: reconcileCollection(
    savedRole.workspaceMembers,
    baselineRole.workspaceMembers,
    draftRole.workspaceMembers,
    (member) => member.id,
  ),
  agents: reconcileCollection(
    savedRole.agents,
    baselineRole.agents,
    draftRole.agents,
    (agent) => agent.id,
  ),
  apiKeys: reconcileCollection(
    savedRole.apiKeys,
    baselineRole.apiKeys,
    draftRole.apiKeys,
    (apiKey) => apiKey.id,
  ),
});
