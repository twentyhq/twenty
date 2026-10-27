import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';

jest.mock('src/engine/core-modules/application/application.service', () => ({
  ApplicationService: class {},
}));
jest.mock(
  'src/engine/workspace-cache/services/workspace-cache.service',
  () => ({ WorkspaceCacheService: class {} }),
);
jest.mock(
  'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service',
  () => ({ WorkspaceMigrationValidateBuildAndRunService: class {} }),
);

const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';
const WORKSPACE_ID = '00000000-0000-4000-8000-000000000005';

const appAgent: FlatAgent = {
  id: '00000000-0000-4000-8000-000000000003',
  universalIdentifier: '00000000-0000-4000-8000-000000000004',
  workspaceId: WORKSPACE_ID,
  applicationId: '00000000-0000-4000-8000-000000000006',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'researcher',
  label: 'Researcher',
  icon: null,
  description: null,
  prompt: 'Research the company',
  modelId: 'auto',
  responseFormat: { type: 'text' },
  modelConfiguration: null,
  triggers: [],
  isCustom: false,
  isSystem: true,
  isActive: true,
  overrides: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  deletedAt: null,
};

const buildFlatAgentMaps = (flatAgent: FlatAgent): FlatEntityMaps<FlatAgent> =>
  addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: flatAgent,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

describe('AgentService', () => {
  it('returns the edit the workspace stored as an override of another application agent', async () => {
    let flatAgentMaps = buildFlatAgentMaps(appAgent);

    const workspaceMigrationValidateBuildAndRunService = {
      validateBuildAndRunWorkspaceMigration: jest.fn(
        async ({
          allFlatEntityOperationByMetadataName,
        }: {
          allFlatEntityOperationByMetadataName: {
            agent: { flatEntityToUpdate: FlatAgent[] };
          };
        }) => {
          const [flatAgentToUpdate] =
            allFlatEntityOperationByMetadataName.agent.flatEntityToUpdate;

          flatAgentMaps = buildFlatAgentMaps(flatAgentToUpdate);

          return { status: 'success' };
        },
      ),
    };
    const workspaceCacheService = {
      getOrRecompute: jest.fn(async () => ({
        flatAgentMaps,
        flatRoleTargetByAgentIdMaps: {},
        flatRoleMaps: createEmptyFlatEntityMaps(),
      })),
    };
    const applicationService = {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(
        async () => ({
          workspaceCustomFlatApplication: {
            universalIdentifier:
              WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        }),
      ),
    };

    const agentService = new AgentService(
      {} as never,
      workspaceMigrationValidateBuildAndRunService as never,
      applicationService as never,
      workspaceCacheService as never,
    );

    const updatedAgent = await agentService.updateOneAgent({
      input: {
        id: appAgent.id,
        prompt: 'Research the market',
        isActive: false,
      },
      workspaceId: WORKSPACE_ID,
    });

    expect(
      flatAgentMaps.byUniversalIdentifier[appAgent.universalIdentifier],
    ).toMatchObject({
      prompt: 'Research the company',
      isActive: true,
    });
    expect(updatedAgent).toMatchObject({
      prompt: 'Research the market',
      isActive: false,
      roleId: null,
    });
  });
});
