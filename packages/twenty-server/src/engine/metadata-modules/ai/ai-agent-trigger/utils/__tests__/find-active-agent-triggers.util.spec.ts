import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { findActiveAgentTriggers } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/find-active-agent-triggers.util';

const buildFlatAgentMaps = (flatAgents: Partial<FlatAgent>[]): FlatAgentMaps =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatAgents.map((flatAgent, index) => [`agent-${index}`, flatAgent]),
    ),
  }) as unknown as FlatAgentMaps;

describe('findActiveAgentTriggers', () => {
  it('should return the active triggers of the requested type', () => {
    const cronTrigger = { type: 'CRON', isActive: true, pattern: '0 * * * *' };
    const flatAgent = {
      deletedAt: null,
      triggers: [
        cronTrigger,
        { type: 'CRON', isActive: false, pattern: '0 0 * * *' },
        {
          type: 'DATABASE_EVENT',
          isActive: true,
          eventName: 'company.created',
        },
      ],
    } as unknown as Partial<FlatAgent>;

    expect(
      findActiveAgentTriggers({
        flatAgentMaps: buildFlatAgentMaps([flatAgent]),
        type: 'CRON',
      }),
    ).toEqual([{ flatAgent, trigger: cronTrigger }]);
  });

  it('should skip agents whose triggers column is not loaded yet', () => {
    expect(
      findActiveAgentTriggers({
        flatAgentMaps: buildFlatAgentMaps([{ deletedAt: null }]),
        type: 'DATABASE_EVENT',
      }),
    ).toEqual([]);
  });
});
