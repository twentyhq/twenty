import { Test, type TestingModule } from '@nestjs/testing';

import { ApiKeysByRoleIdLoaderFactory } from 'src/engine/dataloaders/factories/api-keys-by-role-id-loader.factory';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const ADMIN_ROLE_ID = '20202020-0000-4000-8000-000000000001';
const MEMBER_ROLE_ID = '20202020-0000-4000-8000-000000000002';
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

const FLAT_ENTITY_MAPS = {
  flatRoleMaps: buildFlatEntityMaps([
    { id: ADMIN_ROLE_ID, roleTargetIds: ['target-admin-agent'] },
    {
      id: MEMBER_ROLE_ID,
      roleTargetIds: [
        'target-member-user',
        'target-member-api-key',
        'target-member-api-key-revoked',
      ],
    },
  ]),
  flatRoleTargetMaps: buildFlatEntityMaps([
    { id: 'target-admin-agent', apiKeyId: null, agentId: 'agent' },
    {
      id: 'target-member-user',
      apiKeyId: null,
      userWorkspaceId: 'user-workspace',
    },
    { id: 'target-member-api-key', apiKeyId: 'api-key-active' },
    { id: 'target-member-api-key-revoked', apiKeyId: 'api-key-revoked' },
  ]),
};

const API_KEY_MAP = {
  'api-key-active': {
    id: 'api-key-active',
    name: 'Active key',
    expiresAt: '2027-01-01T00:00:00.000Z',
    revokedAt: null,
  },
  'api-key-revoked': {
    id: 'api-key-revoked',
    name: 'Revoked key',
    expiresAt: '2027-01-01T00:00:00.000Z',
    revokedAt: '2026-01-01T00:00:00.000Z',
  },
};

describe('ApiKeysByRoleIdLoaderFactory', () => {
  let factory: ApiKeysByRoleIdLoaderFactory;
  let getOrRecomputeManyOrAllFlatEntityMaps: jest.Mock;
  let getOrRecompute: jest.Mock;

  beforeEach(async () => {
    // DataLoader dispatches batches on a later tick, which fake timers never run
    jest.useRealTimers();

    getOrRecomputeManyOrAllFlatEntityMaps = jest
      .fn()
      .mockResolvedValue(FLAT_ENTITY_MAPS);
    getOrRecompute = jest.fn().mockResolvedValue({ apiKeyMap: API_KEY_MAP });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysByRoleIdLoaderFactory,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: { getOrRecomputeManyOrAllFlatEntityMaps },
        },
        { provide: WorkspaceCacheService, useValue: { getOrRecompute } },
      ],
    }).compile();

    factory = module.get(ApiKeysByRoleIdLoaderFactory);
  });

  it('should resolve api keys from the cache and skip revoked keys', async () => {
    const loader = factory.create();

    const [adminApiKeys, memberApiKeys, missingRoleApiKeys] = await Promise.all(
      [ADMIN_ROLE_ID, MEMBER_ROLE_ID, MISSING_ROLE_ID].map((roleId) =>
        loader.load({ workspaceId: WORKSPACE_ID, roleId }),
      ),
    );

    expect(getOrRecomputeManyOrAllFlatEntityMaps).toHaveBeenCalledTimes(1);
    expect(getOrRecomputeManyOrAllFlatEntityMaps).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: ['flatRoleMaps', 'flatRoleTargetMaps'],
    });
    expect(getOrRecompute).toHaveBeenCalledTimes(1);
    expect(getOrRecompute).toHaveBeenCalledWith(WORKSPACE_ID, ['apiKeyMap']);
    expect(adminApiKeys).toEqual([]);
    expect(memberApiKeys).toEqual([
      {
        id: 'api-key-active',
        name: 'Active key',
        expiresAt: new Date('2027-01-01T00:00:00.000Z'),
        revokedAt: null,
      },
    ]);
    expect(missingRoleApiKeys).toEqual([]);
  });
});
