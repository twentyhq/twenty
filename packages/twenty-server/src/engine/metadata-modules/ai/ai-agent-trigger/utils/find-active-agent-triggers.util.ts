import {
  type AgentTrigger,
  type AgentTriggerType,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatAgentWithTrigger } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/flat-agent-with-trigger.type';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';

export const findActiveAgentTriggers = <TTriggerType extends AgentTriggerType>({
  flatAgentMaps,
  type,
}: {
  flatAgentMaps: FlatAgentMaps;
  type: TTriggerType;
}): FlatAgentWithTrigger<Extract<AgentTrigger, { type: TTriggerType }>>[] =>
  Object.values(flatAgentMaps.byUniversalIdentifier)
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
