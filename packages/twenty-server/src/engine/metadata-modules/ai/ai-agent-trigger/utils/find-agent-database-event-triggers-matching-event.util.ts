import { type AgentDatabaseEventTrigger } from 'twenty-shared/application';

import { type FlatAgentWithTrigger } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/flat-agent-with-trigger.type';
import { findActiveAgentTriggers } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/find-active-agent-triggers.util';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { isDatabaseEventTriggerListeningToEvent } from 'src/engine/workspace-event-emitter/utils/is-database-event-trigger-listening-to-event.util';

export const findAgentDatabaseEventTriggersMatchingEvent = ({
  flatAgentMaps,
  eventName,
}: {
  flatAgentMaps: FlatAgentMaps;
  eventName: string;
}): FlatAgentWithTrigger<AgentDatabaseEventTrigger>[] =>
  findActiveAgentTriggers({
    flatAgentMaps,
    type: 'DATABASE_EVENT',
  }).filter(({ trigger }) =>
    isDatabaseEventTriggerListeningToEvent({
      triggerEventName: trigger.settings.eventName,
      eventName,
    }),
  );
