import { AgentRunJobScopeService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-job-scope.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';

const WORKSPACE_ID = 'workspace-id';

const buildFlatAgent = (id: string, applicationUniversalIdentifier: string) =>
  ({
    id,
    universalIdentifier: id,
    applicationUniversalIdentifier,
    workspaceId: WORKSPACE_ID,
  }) as never;

const buildService = () => {
  const flatAgentMaps = [
    buildFlatAgent('agent-a', 'application-a'),
    buildFlatAgent('agent-b', 'application-b'),
  ].reduce(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

  return new AgentRunJobScopeService({
    getOrRecompute: jest.fn().mockResolvedValue({ flatAgentMaps }),
  } as never);
};

describe('AgentRunJobScopeService', () => {
  it('scopes runs of agents owned by different applications to their own application', async () => {
    const service = buildService();

    await expect(
      service.resolve({ workspaceId: WORKSPACE_ID, agentId: 'agent-a' }),
    ).resolves.toEqual({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: 'application-a',
    });
    await expect(
      service.resolve({ workspaceId: WORKSPACE_ID, agentId: 'agent-b' }),
    ).resolves.toEqual({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: 'application-b',
    });
  });

  it('falls back to a workspace scope for an agent that no longer exists', async () => {
    await expect(
      buildService().resolve({
        workspaceId: WORKSPACE_ID,
        agentId: 'deleted-agent',
      }),
    ).resolves.toEqual({ workspaceId: WORKSPACE_ID, isWorkspaceJob: true });
  });
});
