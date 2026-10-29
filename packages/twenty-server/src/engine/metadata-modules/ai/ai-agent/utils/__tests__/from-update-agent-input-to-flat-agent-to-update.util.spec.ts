import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { fromUpdateAgentInputToFlatAgentToUpdate } from 'src/engine/metadata-modules/ai/ai-agent/utils/from-update-agent-input-to-flat-agent-to-update.util';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { fromFlatAgentWithRoleIdToAgentDto } from 'src/engine/metadata-modules/flat-agent/utils/from-agent-entity-to-agent-dto.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';

const appAgent: FlatAgent = {
  id: '00000000-0000-4000-8000-000000000003',
  universalIdentifier: '00000000-0000-4000-8000-000000000004',
  workspaceId: '00000000-0000-4000-8000-000000000005',
  applicationId: '00000000-0000-4000-8000-000000000006',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'researcher',
  label: 'Researcher',
  icon: 'IconRobot',
  description: 'Finds things',
  prompt: 'Research the company',
  modelId: 'auto',
  responseFormat: { type: 'text' },
  modelConfiguration: null,
  triggers: [],
  isSystem: true,
  isActive: true,
  overrides: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

const workspaceAgent: FlatAgent = {
  ...appAgent,
  id: '00000000-0000-4000-8000-000000000007',
  universalIdentifier: '00000000-0000-4000-8000-000000000008',
  applicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'writer',
  label: 'Writer',
  isSystem: false,
};

const flatAgentMaps = [appAgent, workspaceAgent].reduce<
  FlatEntityMaps<FlatAgent>
>(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

const updateAsWorkspace = (
  updateAgentInput: Parameters<
    typeof fromUpdateAgentInputToFlatAgentToUpdate
  >[0]['updateAgentInput'],
) =>
  fromUpdateAgentInputToFlatAgentToUpdate({
    updateAgentInput,
    flatAgentMaps,
    flatRoleTargetByAgentIdMaps: {},
    flatRoleMaps: createEmptyFlatEntityMaps(),
    callerApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('fromUpdateAgentInputToFlatAgentToUpdate', () => {
  it('stores edits on another application agent as workspace overrides', () => {
    const { flatAgentToUpdate } = updateAsWorkspace({
      id: appAgent.id,
      name: appAgent.name,
      label: 'Market researcher',
      prompt: 'Research the market',
      modelId: 'gpt-4o',
      isActive: false,
    });

    expect(flatAgentToUpdate).toMatchObject({
      name: 'researcher',
      label: 'Researcher',
      prompt: 'Research the company',
      modelId: 'auto',
      isActive: true,
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          label: 'Market researcher',
          prompt: 'Research the market',
          modelId: 'gpt-4o',
          isActive: false,
        },
      },
    });
    expect(
      fromFlatAgentWithRoleIdToAgentDto({ ...flatAgentToUpdate, roleId: null }),
    ).toMatchObject({
      name: 'researcher',
      label: 'Market researcher',
      prompt: 'Research the market',
      modelId: 'gpt-4o',
      isActive: false,
    });
  });

  it('drops the override entry once the workspace goes back to the application values', () => {
    const { flatAgentToUpdate } = fromUpdateAgentInputToFlatAgentToUpdate({
      updateAgentInput: {
        id: appAgent.id,
        label: 'Researcher',
        isActive: true,
      },
      flatAgentMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: {
          ...appAgent,
          overrides: {
            [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
              label: 'Market researcher',
              isActive: false,
            },
          },
        },
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      flatRoleTargetByAgentIdMaps: {},
      flatRoleMaps: createEmptyFlatEntityMaps(),
      callerApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(flatAgentToUpdate.overrides).toBeNull();
    expect(flatAgentToUpdate.label).toBe('Researcher');
    expect(flatAgentToUpdate.isActive).toBe(true);
  });

  it('ignores a null isActive instead of storing it', () => {
    const { flatAgentToUpdate } = updateAsWorkspace({
      id: appAgent.id,
      label: 'Market researcher',
      isActive: null as unknown as boolean,
    });

    expect(flatAgentToUpdate.isActive).toBe(true);
    expect(
      flatAgentToUpdate.overrides?.[
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER
      ],
    ).toEqual({ label: 'Market researcher' });
  });

  it('refuses to rename another application agent', () => {
    expect(() =>
      updateAsWorkspace({ id: appAgent.id, name: 'renamed' }),
    ).toThrow('Cannot rename an agent owned by another application');
  });

  it('writes edits on a workspace agent to the agent itself', () => {
    const { flatAgentToUpdate } = updateAsWorkspace({
      id: workspaceAgent.id,
      label: 'Copywriter',
      isActive: false,
    });

    expect(flatAgentToUpdate).toMatchObject({
      name: 'copywriter',
      label: 'Copywriter',
      isActive: false,
      overrides: null,
    });
  });
});
