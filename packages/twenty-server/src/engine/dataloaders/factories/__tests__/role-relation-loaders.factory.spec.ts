import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RoleRelationLoadersFactory } from 'src/engine/dataloaders/factories/role-relation-loaders.factory';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const ADMIN_ROLE_ID = '20202020-0000-4000-8000-000000000001';
const MEMBER_ROLE_ID = '20202020-0000-4000-8000-000000000002';
const GUEST_ROLE_ID = '20202020-0000-4000-8000-000000000003';

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

const buildRoleTarget = ({
  id,
  roleId,
  userWorkspaceId = null,
  agentId = null,
  apiKeyId = null,
}: {
  id: string;
  roleId: string;
  userWorkspaceId?: string | null;
  agentId?: string | null;
  apiKeyId?: string | null;
}) => ({ id, roleId, userWorkspaceId, agentId, apiKeyId });

const buildAgent = ({
  id,
  deletedAt = null,
}: {
  id: string;
  deletedAt?: string | null;
}) => ({
  id,
  name: id,
  label: id,
  description: null,
  icon: null,
  prompt: 'prompt',
  modelId: 'model',
  modelConfiguration: null,
  responseFormat: null,
  evaluationInputs: [],
  isCustom: true,
  applicationId: 'application',
  workspaceId: WORKSPACE_ID,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt,
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

const CACHE_DATA = {
  flatRoleTargetMaps: buildFlatEntityMaps([
    buildRoleTarget({
      id: 'target-admin-user',
      roleId: ADMIN_ROLE_ID,
      userWorkspaceId: 'user-workspace-jane',
    }),
    buildRoleTarget({
      id: 'target-member-user-1',
      roleId: MEMBER_ROLE_ID,
      userWorkspaceId: 'user-workspace-jony',
    }),
    buildRoleTarget({
      id: 'target-member-user-2',
      roleId: MEMBER_ROLE_ID,
      userWorkspaceId: 'user-workspace-phil',
    }),
    buildRoleTarget({
      id: 'target-member-user-deleted',
      roleId: MEMBER_ROLE_ID,
      userWorkspaceId: 'user-workspace-deleted',
    }),
    buildRoleTarget({
      id: 'target-admin-agent',
      roleId: ADMIN_ROLE_ID,
      agentId: 'agent-active',
    }),
    buildRoleTarget({
      id: 'target-admin-agent-deleted',
      roleId: ADMIN_ROLE_ID,
      agentId: 'agent-deleted',
    }),
    buildRoleTarget({
      id: 'target-member-api-key',
      roleId: MEMBER_ROLE_ID,
      apiKeyId: 'api-key-active',
    }),
    buildRoleTarget({
      id: 'target-member-api-key-revoked',
      roleId: MEMBER_ROLE_ID,
      apiKeyId: 'api-key-revoked',
    }),
  ]),
  flatWorkspaceMemberMaps: {
    byId: {
      'member-jane': {
        id: 'member-jane',
        userId: 'user-jane',
        deletedAt: null,
      },
      'member-jony': {
        id: 'member-jony',
        userId: 'user-jony',
        deletedAt: null,
      },
      'member-phil': {
        id: 'member-phil',
        userId: 'user-phil',
        deletedAt: null,
      },
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
  },
  flatAgentMaps: buildFlatEntityMaps([
    buildAgent({ id: 'agent-active' }),
    buildAgent({ id: 'agent-deleted', deletedAt: '2026-01-01T00:00:00.000Z' }),
  ]),
  apiKeyMap: {
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
  },
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

describe('RoleRelationLoadersFactory', () => {
  let factory: RoleRelationLoadersFactory;
  let getOrRecompute: jest.Mock;
  let hasRowLevelPermissionFeature: jest.Mock;
  let userWorkspaceRepository: { find: jest.Mock };

  beforeEach(async () => {
    // DataLoader dispatches batches on a later tick, which fake timers never run
    jest.useRealTimers();

    getOrRecompute = jest.fn(
      async (_workspaceId: string, keys: (keyof typeof CACHE_DATA)[]) =>
        Object.fromEntries(keys.map((key) => [key, CACHE_DATA[key]])),
    );
    hasRowLevelPermissionFeature = jest.fn().mockResolvedValue(true);
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
        RoleRelationLoadersFactory,
        { provide: WorkspaceCacheService, useValue: { getOrRecompute } },
        {
          provide: RowLevelPermissionPredicateService,
          useValue: { hasRowLevelPermissionFeature },
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
      ],
    }).compile();

    factory = module.get(RoleRelationLoadersFactory);
  });

  const loadForAllRoles = <TResult>(loader: {
    load: (payload: {
      workspaceId: string;
      roleId: string;
    }) => Promise<TResult>;
  }) =>
    Promise.all(
      [ADMIN_ROLE_ID, MEMBER_ROLE_ID, GUEST_ROLE_ID].map((roleId) =>
        loader.load({ workspaceId: WORKSPACE_ID, roleId }),
      ),
    );

  it('should load workspace members of every role with a single user workspace query', async () => {
    const { workspaceMembersByRoleIdLoader } = factory.create();

    const [adminMembers, memberMembers, guestMembers] = await loadForAllRoles(
      workspaceMembersByRoleIdLoader,
    );

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
    const { workspaceMembersByRoleIdLoader } = factory.create();

    const guestMembers = await workspaceMembersByRoleIdLoader.load({
      workspaceId: WORKSPACE_ID,
      roleId: GUEST_ROLE_ID,
    });

    expect(guestMembers).toEqual([]);
    expect(userWorkspaceRepository.find).not.toHaveBeenCalled();
  });

  it('should resolve agents from the cache and skip deleted agents', async () => {
    const { agentsByRoleIdLoader } = factory.create();

    const [adminAgents, memberAgents, guestAgents] =
      await loadForAllRoles(agentsByRoleIdLoader);

    expect(adminAgents).toHaveLength(1);
    expect(adminAgents[0]).toMatchObject({
      id: 'agent-active',
      roleId: ADMIN_ROLE_ID,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(memberAgents).toEqual([]);
    expect(guestAgents).toEqual([]);
    expect(userWorkspaceRepository.find).not.toHaveBeenCalled();
  });

  it('should resolve api keys from the cache and skip revoked keys', async () => {
    const { apiKeysByRoleIdLoader } = factory.create();

    const [adminApiKeys, memberApiKeys] = await loadForAllRoles(
      apiKeysByRoleIdLoader,
    );

    expect(adminApiKeys).toEqual([]);
    expect(memberApiKeys).toEqual([
      {
        id: 'api-key-active',
        name: 'Active key',
        expiresAt: new Date('2027-01-01T00:00:00.000Z'),
        revokedAt: null,
      },
    ]);
    expect(userWorkspaceRepository.find).not.toHaveBeenCalled();
  });

  it('should check the row level permission entitlement once for all roles', async () => {
    const { rowLevelPermissionsByRoleIdLoader } = factory.create();

    const [adminPermissions, memberPermissions, guestPermissions] =
      await loadForAllRoles(rowLevelPermissionsByRoleIdLoader);

    expect(hasRowLevelPermissionFeature).toHaveBeenCalledTimes(1);
    expect(hasRowLevelPermissionFeature).toHaveBeenCalledWith(WORKSPACE_ID);
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
    expect(guestPermissions).toEqual({
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });
  });

  it('should return no row level permissions when the feature is not available', async () => {
    hasRowLevelPermissionFeature.mockResolvedValue(false);

    const { rowLevelPermissionsByRoleIdLoader } = factory.create();

    const [adminPermissions] = await loadForAllRoles(
      rowLevelPermissionsByRoleIdLoader,
    );

    expect(adminPermissions).toEqual({
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });
    expect(getOrRecompute).not.toHaveBeenCalled();
  });
});
