import { type AgentDatabaseEventTrigger } from 'twenty-shared/application';

import { type FlatAgentWithTrigger } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/flat-agent-with-trigger.type';
import { findActiveAgentTriggers } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/find-active-agent-triggers.util';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { computeTriggerEventNamesMatchingEvent } from 'src/engine/workspace-event-emitter/utils/compute-trigger-event-names-matching-event.util';

export const findAgentDatabaseEventTriggersMatchingEvent = ({
  flatAgentMaps,
  eventName,
}: {
  flatAgentMaps: FlatAgentMaps;
  eventName: string;
}): FlatAgentWithTrigger<AgentDatabaseEventTrigger>[] => {
  const matchingTriggerEventNames =
    computeTriggerEventNamesMatchingEvent(eventName);

  return findActiveAgentTriggers({
    flatAgentMaps,
    type: 'DATABASE_EVENT',
  }).filter(({ trigger }) =>
    matchingTriggerEventNames.includes(trigger.settings.eventName),
  );
};
