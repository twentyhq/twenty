import { getRowLevelPermissionPredicateGroupIdsWithAncestors } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getRowLevelPermissionPredicateGroupIdsWithAncestors';

const PREDICATE_GROUPS = [
  { id: 'root', parentRowLevelPermissionPredicateGroupId: null },
  { id: 'middle', parentRowLevelPermissionPredicateGroupId: 'root' },
  { id: 'leaf', parentRowLevelPermissionPredicateGroupId: 'middle' },
  { id: 'unrelated', parentRowLevelPermissionPredicateGroupId: null },
];

describe('getRowLevelPermissionPredicateGroupIdsWithAncestors', () => {
  it('returns the group of each predicate and all its ancestors', () => {
    const result = getRowLevelPermissionPredicateGroupIdsWithAncestors({
      predicates: [{ rowLevelPermissionPredicateGroupId: 'leaf' }],
      predicateGroups: PREDICATE_GROUPS,
    });

    expect([...result].sort()).toEqual(['leaf', 'middle', 'root']);
  });

  it('ignores ungrouped predicates', () => {
    const result = getRowLevelPermissionPredicateGroupIdsWithAncestors({
      predicates: [{ rowLevelPermissionPredicateGroupId: null }],
      predicateGroups: PREDICATE_GROUPS,
    });

    expect(result.size).toBe(0);
  });
});
