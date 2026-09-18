import { computeRowLevelPermissionRowsToPurge } from 'src/database/commands/upgrade-version-command/2-42/utils/compute-row-level-permission-rows-to-purge.util';

const DELETED_AT = '2026-09-16T10:00:00.000Z';

type GroupInput = {
  id: string;
  parentRowLevelPermissionPredicateGroupId?: string | null;
  deletedAt?: string | null;
};

type PredicateInput = {
  id: string;
  rowLevelPermissionPredicateGroupId?: string | null;
  deletedAt?: string | null;
};

const buildMaps = <TRow extends { id: string }>(rows: TRow[]) => ({
  byUniversalIdentifier: Object.fromEntries(rows.map((row) => [row.id, row])),
});

const purge = ({
  groups = [],
  predicates = [],
}: {
  groups?: GroupInput[];
  predicates?: PredicateInput[];
}) => {
  const { groupsToDelete, predicatesToDelete } =
    computeRowLevelPermissionRowsToPurge({
      flatRowLevelPermissionPredicateGroupMaps: buildMaps(
        groups.map((group) => ({
          parentRowLevelPermissionPredicateGroupId: null,
          deletedAt: null,
          ...group,
        })),
      ),
      flatRowLevelPermissionPredicateMaps: buildMaps(
        predicates.map((predicate) => ({
          rowLevelPermissionPredicateGroupId: null,
          deletedAt: null,
          ...predicate,
        })),
      ),
    });

  return {
    groupIds: groupsToDelete.map(({ id }) => id).sort(),
    predicateIds: predicatesToDelete.map(({ id }) => id).sort(),
  };
};

describe('computeRowLevelPermissionRowsToPurge', () => {
  it('should purge nothing when no row is soft-deleted', () => {
    expect(
      purge({
        groups: [{ id: 'group-1' }, { id: 'group-2' }],
        predicates: [
          { id: 'predicate-1', rowLevelPermissionPredicateGroupId: 'group-1' },
        ],
      }),
    ).toEqual({ groupIds: [], predicateIds: [] });
  });

  it('should purge a soft-deleted group and every live group nested under it', () => {
    expect(
      purge({
        groups: [
          { id: 'deleted-parent', deletedAt: DELETED_AT },
          {
            id: 'live-child',
            parentRowLevelPermissionPredicateGroupId: 'deleted-parent',
          },
          {
            id: 'live-grand-child',
            parentRowLevelPermissionPredicateGroupId: 'live-child',
          },
          { id: 'unrelated-group' },
        ],
      }).groupIds,
    ).toEqual(['deleted-parent', 'live-child', 'live-grand-child']);
  });

  it('should purge live predicates orphaned under a purged group', () => {
    expect(
      purge({
        groups: [
          { id: 'deleted-parent', deletedAt: DELETED_AT },
          {
            id: 'live-child',
            parentRowLevelPermissionPredicateGroupId: 'deleted-parent',
          },
        ],
        predicates: [
          {
            id: 'predicate-of-deleted-parent',
            rowLevelPermissionPredicateGroupId: 'deleted-parent',
          },
          {
            id: 'predicate-of-live-child',
            rowLevelPermissionPredicateGroupId: 'live-child',
          },
          { id: 'unrelated-predicate' },
        ],
      }).predicateIds,
    ).toEqual(['predicate-of-deleted-parent', 'predicate-of-live-child']);
  });

  it('should purge a soft-deleted predicate that belongs to no group', () => {
    expect(
      purge({
        predicates: [
          { id: 'standalone-deleted-predicate', deletedAt: DELETED_AT },
          { id: 'standalone-live-predicate' },
        ],
      }),
    ).toEqual({
      groupIds: [],
      predicateIds: ['standalone-deleted-predicate'],
    });
  });

  it('should terminate and purge every group of a cycle reachable from a soft-deleted group', () => {
    expect(
      purge({
        groups: [
          { id: 'deleted-root', deletedAt: DELETED_AT },
          {
            id: 'cyclic-first',
            parentRowLevelPermissionPredicateGroupId: 'deleted-root',
          },
          {
            id: 'cyclic-second',
            parentRowLevelPermissionPredicateGroupId: 'cyclic-first',
          },
        ],
      }).groupIds,
    ).toEqual(['cyclic-first', 'cyclic-second', 'deleted-root']);
  });

  it('should leave a cycle untouched when no group in it is soft-deleted', () => {
    expect(
      purge({
        groups: [
          {
            id: 'cyclic-first',
            parentRowLevelPermissionPredicateGroupId: 'cyclic-second',
          },
          {
            id: 'cyclic-second',
            parentRowLevelPermissionPredicateGroupId: 'cyclic-first',
          },
        ],
        predicates: [
          {
            id: 'predicate',
            rowLevelPermissionPredicateGroupId: 'cyclic-first',
          },
        ],
      }),
    ).toEqual({ groupIds: [], predicateIds: [] });
  });

  it('should leave a live sibling subtree untouched', () => {
    expect(
      purge({
        groups: [
          { id: 'deleted-parent', deletedAt: DELETED_AT },
          {
            id: 'live-child',
            parentRowLevelPermissionPredicateGroupId: 'deleted-parent',
          },
          { id: 'live-sibling-parent' },
          {
            id: 'live-sibling-child',
            parentRowLevelPermissionPredicateGroupId: 'live-sibling-parent',
          },
        ],
        predicates: [
          {
            id: 'live-sibling-predicate',
            rowLevelPermissionPredicateGroupId: 'live-sibling-child',
          },
        ],
      }),
    ).toEqual({
      groupIds: ['deleted-parent', 'live-child'],
      predicateIds: [],
    });
  });
});
