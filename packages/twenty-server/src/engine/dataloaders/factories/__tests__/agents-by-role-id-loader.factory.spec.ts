import { Test, type TestingModule } from '@nestjs/testing';

import { AgentsByRoleIdLoaderFactory } from 'src/engine/dataloaders/factories/agents-by-role-id-loader.factory';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

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

const buildAgent = ({
  id,
  applicationId = 'application',
  deletedAt = null,
}: {
  id: string;
  applicationId?: string;
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
  applicationId,
  workspaceId: WORKSPACE_ID,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt,
});

const FLAT_ENTITY_MAPS = {
  flatRoleMaps: buildFlatEntityMaps([
    {
      id: ADMIN_ROLE_ID,
      roleTargetIds: [
        'target-admin-user',
        'target-admin-agent',
        'target-admin-agent-deleted',
        'target-admin-agent-orphan',
      ],
    },
    { id: MEMBER_ROLE_ID, roleTargetIds: ['target-member-api-key'] },
    { id: GUEST_ROLE_ID, roleTargetIds: [] },
  ]),
  flatRoleTargetMaps: buildFlatEntityMaps([
    {
      id: 'target-admin-user',
      agentId: null,
      userWorkspaceId: 'user-workspace-jane',
    },
    { id: 'target-admin-agent', agentId: 'agent-active' },
    { id: 'target-admin-agent-deleted', agentId: 'agent-deleted' },
    { id: 'target-admin-agent-orphan', agentId: 'agent-orphan' },
    { id: 'target-member-api-key', agentId: null, apiKeyId: 'api-key' },
  ]),
  flatAgentMaps: buildFlatEntityMaps([
    buildAgent({ id: 'agent-active' }),
    buildAgent({ id: 'agent-deleted', deletedAt: '2026-01-01T00:00:00.000Z' }),
    buildAgent({ id: 'agent-orphan', applicationId: 'missing-application' }),
  ]),
  flatApplicationMaps: {
    byId: { application: { id: 'application' } },
  },
};

describe('AgentsByRoleIdLoaderFactory', () => {
  let factory: AgentsByRoleIdLoaderFactory;
  let getOrRecomputeManyOrAllFlatEntityMaps: jest.Mock;

  beforeEach(async () => {
    // DataLoader dispatches batches on a later tick, which fake timers never run
    jest.useRealTimers();

    getOrRecomputeManyOrAllFlatEntityMaps = jest
      .fn()
      .mockResolvedValue(FLAT_ENTITY_MAPS);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsByRoleIdLoaderFactory,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: { getOrRecomputeManyOrAllFlatEntityMaps },
        },
      ],
    }).compile();

    factory = module.get(AgentsByRoleIdLoaderFactory);
  });

  it('should resolve agents from the cache and skip deleted or orphaned agents', async () => {
    const loader = factory.create();

    const [adminAgents, memberAgents, guestAgents, missingRoleAgents] =
      await Promise.all(
        [ADMIN_ROLE_ID, MEMBER_ROLE_ID, GUEST_ROLE_ID, MISSING_ROLE_ID].map(
          (roleId) => loader.load({ workspaceId: WORKSPACE_ID, roleId }),
        ),
      );

    expect(getOrRecomputeManyOrAllFlatEntityMaps).toHaveBeenCalledTimes(1);
    expect(getOrRecomputeManyOrAllFlatEntityMaps).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: [
        'flatRoleMaps',
        'flatRoleTargetMaps',
        'flatAgentMaps',
        'flatApplicationMaps',
      ],
    });
    expect(adminAgents).toHaveLength(1);
    expect(adminAgents[0]).toMatchObject({
      id: 'agent-active',
      roleId: ADMIN_ROLE_ID,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(memberAgents).toEqual([]);
    expect(guestAgents).toEqual([]);
    expect(missingRoleAgents).toEqual([]);
  });
});
