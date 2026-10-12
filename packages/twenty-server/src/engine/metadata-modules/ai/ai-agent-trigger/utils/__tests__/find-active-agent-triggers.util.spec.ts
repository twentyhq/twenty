import { type AgentTrigger } from 'twenty-shared/application';

import { findActiveAgentTriggers } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/find-active-agent-triggers.util';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';

const AGENT_ID = 'agent-id';

const buildCronTrigger = (isActive: boolean): AgentTrigger => ({
  id: `cron-trigger-${isActive ? 'active' : 'inactive'}`,
  type: 'CRON',
  isActive,
  instructions: 'Send the weekly digest',
  settings: { pattern: '0 9 * * 1' },
});

const buildFlatAgentMaps = (agentProperties: object) =>
  addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: {
      id: AGENT_ID,
      universalIdentifier: AGENT_ID,
      workspaceId: 'workspace-id',
      deletedAt: null,
      ...agentProperties,
    } as never,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

describe('findActiveAgentTriggers', () => {
  it('should return the active triggers of the requested type', () => {
    const activeTrigger = buildCronTrigger(true);

    expect(
      findActiveAgentTriggers({
        flatAgentMaps: buildFlatAgentMaps({
          triggers: [activeTrigger, buildCronTrigger(false)],
        }),
        type: 'CRON',
        hiddenAgentColumnPropertyNames: new Set(),
      }),
    ).toEqual([
      {
        flatAgent: expect.objectContaining({ id: AGENT_ID }),
        trigger: activeTrigger,
      },
    ]);
  });

  it('should return no trigger while the upgrade cursor hides the triggers column', () => {
    const getHiddenColumnPropertyNamesSpy = jest
      .spyOn(
        UpgradeAwareRepositoryState.getInstance(),
        'getHiddenColumnPropertyNames',
      )
      .mockImplementation((entityClass) =>
        entityClass === AgentEntity ? new Set(['triggers']) : new Set(),
      );

    expect(
      findActiveAgentTriggers({
        flatAgentMaps: buildFlatAgentMaps({}),
        type: 'CRON',
      }),
    ).toEqual([]);

    getHiddenColumnPropertyNamesSpy.mockRestore();
  });
});
