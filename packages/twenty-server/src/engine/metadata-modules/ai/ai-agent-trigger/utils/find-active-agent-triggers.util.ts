import {
  type AgentTrigger,
  type AgentTriggerType,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatAgentWithTrigger } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/flat-agent-with-trigger.type';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';

export const findActiveAgentTriggers = <TTriggerType extends AgentTriggerType>({
  flatAgentMaps,
  type,
  hiddenAgentColumnPropertyNames = UpgradeAwareRepositoryState.getInstance().getHiddenColumnPropertyNames(
    AgentEntity,
  ),
}: {
  flatAgentMaps: FlatAgentMaps;
  type: TTriggerType;
  hiddenAgentColumnPropertyNames?: ReadonlySet<string>;
}): FlatAgentWithTrigger<Extract<AgentTrigger, { type: TTriggerType }>>[] => {
  // A process started before the upgrade step adding agent triggers loads agents without them until it restarts
  if (hiddenAgentColumnPropertyNames.has('triggers')) {
    return [];
  }

  return Object.values(flatAgentMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((flatAgent) => !isDefined(flatAgent.deletedAt))
    .flatMap((flatAgent) =>
      flatAgent.triggers
        .filter(
          (trigger): trigger is Extract<AgentTrigger, { type: TTriggerType }> =>
            trigger.type === type && trigger.isActive,
        )
        .map((trigger) => ({ flatAgent, trigger })),
    );
};
