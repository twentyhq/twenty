import { Test, type TestingModule } from '@nestjs/testing';

import { RowLevelPermissionsByRoleIdLoaderFactory } from 'src/engine/dataloaders/factories/row-level-permissions-by-role-id-loader.factory';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const ADMIN_ROLE_ID = '20202020-0000-4000-8000-000000000001';
const MEMBER_ROLE_ID = '20202020-0000-4000-8000-000000000002';
const GUEST_ROLE_ID = '20202020-0000-4000-8000-000000000003';
const MISSING_ROLE_ID = '20202020-0000-4000-8000-000000000004';

const buildFlatEntityMaps = <TEntity extends { id: string }>(
  entities: TEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [`${entity.id}-universal`, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, `${entity.id}-universal`]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildPredicate = ({
  id,
  roleId,
  position,
  deletedAt = null,
}: {
  id: string;
  roleId: string;
  position: number;
  deletedAt?: string | null;
}) => ({
  id,
  roleId,
  positionInRowLevelPermissionPredicateGroup: position,
  deletedAt,
});

const EMPTY_ROW_LEVEL_PERMISSIONS = {
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const FLAT_ENTITY_MAPS = {
  flatRoleMaps: buildFlatEntityMaps([
    {
      id: ADMIN_ROLE_ID,
      rowLevelPermissionPredicateIds: [
        'predicate-2',
        'predicate-1',
        'predicate-deleted',
      ],
      rowLevelPermissionPredicateGroupIds: [],
    },
    {
      id: MEMBER_ROLE_ID,
      rowLevelPermissionPredicateIds: ['predicate-3'],
      rowLevelPermissionPredicateGroupIds: ['group-1'],
    },
    {
      id: GUEST_ROLE_ID,
      rowLevelPermissionPredicateIds: [],
      rowLevelPermissionPredicateGroupIds: [],
    },
  ]),
  flatRowLevelPermissionPredicateMaps: buildFlatEntityMaps([
    buildPredicate({ id: 'predicate-2', roleId: ADMIN_ROLE_ID, position: 2 }),
    buildPredicate({ id: 'predicate-1', roleId: ADMIN_ROLE_ID, position: 1 }),
    buildPredicate({
      id: 'predicate-deleted',
      roleId: ADMIN_ROLE_ID,
      position: 0,
      deletedAt: '2026-01-01T00:00:00.000Z',
    }),
    buildPredicate({ id: 'predicate-3', roleId: MEMBER_ROLE_ID, position: 0 }),
  ]),
  flatRowLevelPermissionPredicateGroupMaps: buildFlatEntityMaps([
    buildPredicate({ id: 'group-1', roleId: MEMBER_ROLE_ID, position: 0 }),
  ]),
};

describe('RowLevelPermissionsByRoleIdLoaderFactory', () => {
  let factory: RowLevelPermissionsByRoleIdLoaderFactory;
  let getOrRecomputeManyOrAllFlatEntityMaps: jest.Mock;
  let hasRowLevelPermissionFeature: jest.Mock;

  beforeEach(async () => {
    // DataLoader dispatches batches on a later tick, which fake timers never run
    jest.useRealTimers();

    getOrRecomputeManyOrAllFlatEntityMaps = jest
      .fn()
      .mockResolvedValue(FLAT_ENTITY_MAPS);
    hasRowLevelPermissionFeature = jest.fn().mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RowLevelPermissionsByRoleIdLoaderFactory,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: { getOrRecomputeManyOrAllFlatEntityMaps },
        },
        {
          provide: RowLevelPermissionPredicateService,
          useValue: { hasRowLevelPermissionFeature },
        },
      ],
    }).compile();

    factory = module.get(RowLevelPermissionsByRoleIdLoaderFactory);
  });

  const loadForRoles = (roleIds: string[]) => {
    const loader = factory.create();

    return Promise.all(
      roleIds.map((roleId) =>
        loader.load({ workspaceId: WORKSPACE_ID, roleId }),
      ),
    );
  };

  it('should check the row level permission entitlement once for all roles', async () => {
    const [adminPermissions, memberPermissions, guestPermissions] =
      await loadForRoles([ADMIN_ROLE_ID, MEMBER_ROLE_ID, GUEST_ROLE_ID]);

    expect(hasRowLevelPermissionFeature).toHaveBeenCalledTimes(1);
    expect(hasRowLevelPermissionFeature).toHaveBeenCalledWith(WORKSPACE_ID);
    expect(getOrRecomputeManyOrAllFlatEntityMaps).toHaveBeenCalledTimes(1);
    expect(getOrRecomputeManyOrAllFlatEntityMaps).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: [
        'flatRoleMaps',
        'flatRowLevelPermissionPredicateMaps',
        'flatRowLevelPermissionPredicateGroupMaps',
      ],
    });
    expect(
      adminPermissions.rowLevelPermissionPredicates.map(
        (predicate) => predicate.id,
      ),
    ).toEqual(['predicate-1', 'predicate-2']);
    expect(adminPermissions.rowLevelPermissionPredicateGroups).toEqual([]);
    expect(
      memberPermissions.rowLevelPermissionPredicates.map(
        (predicate) => predicate.id,
      ),
    ).toEqual(['predicate-3']);
    expect(
      memberPermissions.rowLevelPermissionPredicateGroups.map(
        (predicateGroup) => predicateGroup.id,
      ),
    ).toEqual(['group-1']);
    expect(guestPermissions).toEqual(EMPTY_ROW_LEVEL_PERMISSIONS);
  });

  it('should return no row level permissions for a role missing from the cache', async () => {
    const [missingRolePermissions] = await loadForRoles([MISSING_ROLE_ID]);

    expect(missingRolePermissions).toEqual(EMPTY_ROW_LEVEL_PERMISSIONS);
  });

  it('should return no row level permissions when the feature is not available', async () => {
    hasRowLevelPermissionFeature.mockResolvedValue(false);

    const [adminPermissions] = await loadForRoles([
      ADMIN_ROLE_ID,
      MEMBER_ROLE_ID,
    ]);

    expect(adminPermissions).toEqual(EMPTY_ROW_LEVEL_PERMISSIONS);
    expect(getOrRecomputeManyOrAllFlatEntityMaps).not.toHaveBeenCalled();
  });
});
