import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceMembersByRoleIdLoaderFactory } from 'src/engine/dataloaders/factories/workspace-members-by-role-id-loader.factory';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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

const FLAT_ENTITY_MAPS = {
  flatRoleMaps: buildFlatEntityMaps([
    { id: ADMIN_ROLE_ID, roleTargetIds: ['target-admin-user', 'target-agent'] },
    {
      id: MEMBER_ROLE_ID,
      roleTargetIds: [
        'target-member-user-1',
        'target-member-user-2',
        'target-member-user-deleted',
        'target-member-api-key',
      ],
    },
    { id: GUEST_ROLE_ID, roleTargetIds: [] },
  ]),
  flatRoleTargetMaps: buildFlatEntityMaps([
    { id: 'target-admin-user', userWorkspaceId: 'user-workspace-jane' },
    { id: 'target-agent', userWorkspaceId: null, agentId: 'agent' },
    { id: 'target-member-user-1', userWorkspaceId: 'user-workspace-jony' },
    { id: 'target-member-user-2', userWorkspaceId: 'user-workspace-phil' },
    {
      id: 'target-member-user-deleted',
      userWorkspaceId: 'user-workspace-deleted',
    },
    { id: 'target-member-api-key', userWorkspaceId: null, apiKeyId: 'key' },
  ]),
};

const FLAT_WORKSPACE_MEMBER_MAPS = {
  byId: {
    'member-jane': { id: 'member-jane', userId: 'user-jane', deletedAt: null },
    'member-jony': { id: 'member-jony', userId: 'user-jony', deletedAt: null },
    'member-phil': { id: 'member-phil', userId: 'user-phil', deletedAt: null },
    'member-deleted': {
      id: 'member-deleted',
      userId: 'user-deleted',
      deletedAt: '2026-01-01T00:00:00.000Z',
    },
  },
  idByUserId: {
    'user-jane': 'member-jane',
    'user-jony': 'member-jony',
    'user-phil': 'member-phil',
    'user-deleted': 'member-deleted',
  },
};

describe('WorkspaceMembersByRoleIdLoaderFactory', () => {
  let factory: WorkspaceMembersByRoleIdLoaderFactory;
  let getOrRecomputeManyOrAllFlatEntityMaps: jest.Mock;
  let getOrRecompute: jest.Mock;
  let userWorkspaceRepository: { find: jest.Mock };

  beforeEach(async () => {
    // DataLoader dispatches batches on a later tick, which fake timers never run
    jest.useRealTimers();

    getOrRecomputeManyOrAllFlatEntityMaps = jest
      .fn()
      .mockResolvedValue(FLAT_ENTITY_MAPS);
    getOrRecompute = jest.fn().mockResolvedValue({
      flatWorkspaceMemberMaps: FLAT_WORKSPACE_MEMBER_MAPS,
    });
    userWorkspaceRepository = {
      find: jest.fn().mockResolvedValue([
        { id: 'user-workspace-jane', userId: 'user-jane' },
        { id: 'user-workspace-jony', userId: 'user-jony' },
        { id: 'user-workspace-phil', userId: 'user-phil' },
        { id: 'user-workspace-deleted', userId: 'user-deleted' },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceMembersByRoleIdLoaderFactory,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: { getOrRecomputeManyOrAllFlatEntityMaps },
        },
        { provide: WorkspaceCacheService, useValue: { getOrRecompute } },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
      ],
    }).compile();

    factory = module.get(WorkspaceMembersByRoleIdLoaderFactory);
  });

  it('should load workspace members of every role with a single user workspace query', async () => {
    const loader = factory.create();

    const [adminMembers, memberMembers, guestMembers] = await Promise.all(
      [ADMIN_ROLE_ID, MEMBER_ROLE_ID, GUEST_ROLE_ID].map((roleId) =>
        loader.load({ workspaceId: WORKSPACE_ID, roleId }),
      ),
    );

    expect(getOrRecomputeManyOrAllFlatEntityMaps).toHaveBeenCalledTimes(1);
    expect(getOrRecomputeManyOrAllFlatEntityMaps).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: ['flatRoleMaps', 'flatRoleTargetMaps'],
    });
    expect(getOrRecompute).toHaveBeenCalledTimes(1);
    expect(getOrRecompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatWorkspaceMemberMaps',
    ]);
    expect(userWorkspaceRepository.find).toHaveBeenCalledTimes(1);
    expect(userWorkspaceRepository.find).toHaveBeenCalledWith({
      select: { id: true, userId: true },
      where: {
        id: In([
          'user-workspace-jane',
          'user-workspace-jony',
          'user-workspace-phil',
          'user-workspace-deleted',
        ]),
        workspaceId: WORKSPACE_ID,
      },
    });
    expect(adminMembers.map((member) => member.id)).toEqual(['member-jane']);
    expect(memberMembers.map((member) => member.id)).toEqual([
      'member-jony',
      'member-phil',
    ]);
    expect(guestMembers).toEqual([]);
  });

  it('should not query user workspaces when no requested role has users', async () => {
    const loader = factory.create();

    const guestMembers = await loader.load({
      workspaceId: WORKSPACE_ID,
      roleId: GUEST_ROLE_ID,
    });

    expect(guestMembers).toEqual([]);
    expect(userWorkspaceRepository.find).not.toHaveBeenCalled();
  });

  it('should return no workspace members for a role missing from the cache', async () => {
    const loader = factory.create();

    const missingRoleMembers = await loader.load({
      workspaceId: WORKSPACE_ID,
      roleId: MISSING_ROLE_ID,
    });

    expect(missingRoleMembers).toEqual([]);
    expect(userWorkspaceRepository.find).not.toHaveBeenCalled();
  });
});
