import chunk from 'lodash.chunk';

import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type LogicFunctionTriggerJobData } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { MAX_EVENTS_PER_TRIGGER_JOB } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/constants/max-events-per-trigger-job.constant';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type filterEventsMatchingDatabaseEventTrigger } from 'src/engine/workspace-event-emitter/utils/filter-events-matching-database-event-trigger.util';

type FilterMatchingEvents = (
  args: Pick<
    Parameters<typeof filterEventsMatchingDatabaseEventTrigger>[0],
    'events' | 'eventName' | 'watchedFields' | 'condition' | 'conditionBindings'
  >,
) => ReturnType<typeof filterEventsMatchingDatabaseEventTrigger>;

export const transformEventBatchToEventPayloads = async ({
  workspaceEventBatch,
  logicFunctions,
  filterMatchingEvents,
  onConditionError,
}: {
  workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  logicFunctions: Pick<
    LogicFunctionEntity,
    'id' | 'workspaceId' | 'databaseEventTriggerSettings'
  >[];
  filterMatchingEvents: FilterMatchingEvents;
  onConditionError?: (conditionError: {
    logicFunctionId: string;
    errorMessage: string;
  }) => void;
}): Promise<LogicFunctionTriggerJobData[]> => {
  const result: LogicFunctionTriggerJobData[] = [];
  const { events, ...batchEventInfo } = workspaceEventBatch;

  for (const logicFunction of logicFunctions) {
    const triggerSettings = logicFunction.databaseEventTriggerSettings;

    const { events: filteredEvents, conditionErrorMessage } =
      await filterMatchingEvents({
        events,
        eventName: workspaceEventBatch.name,
        watchedFields: triggerSettings?.updatedFields,
        condition: triggerSettings?.condition,
        conditionBindings: triggerSettings?.conditionBindings,
      });

    if (isDefined(conditionErrorMessage)) {
      onConditionError?.({
        logicFunctionId: logicFunction.id,
        errorMessage: conditionErrorMessage,
      });
    }

    if (triggerSettings?.batchMode !== true) {
      for (const event of filteredEvents) {
        result.push({
          logicFunctionId: logicFunction.id,
          workspaceId: logicFunction.workspaceId,
          payload: {
            ...batchEventInfo,
            ...event,
          },
          ...buildAuthContext(event),
        });
      }

      continue;
    }

    // A job carries a single auth context, so events acted by different users can never share one
    for (const eventsSharingAuthContext of groupEventsByAuthContext(
      filteredEvents,
    )) {
      for (const eventsChunk of chunk(
        eventsSharingAuthContext,
        MAX_EVENTS_PER_TRIGGER_JOB,
      )) {
        result.push({
          logicFunctionId: logicFunction.id,
          workspaceId: logicFunction.workspaceId,
          payload: {
            ...batchEventInfo,
            events: eventsChunk,
          },
          ...buildAuthContext(eventsChunk[0]),
        });
      }
    }
  }

  return result;
};

const buildAuthContext = (event: ObjectRecordEvent) => ({
  ...(isDefined(event.userId) ? { userId: event.userId } : {}),
  ...(isDefined(event.userWorkspaceId)
    ? { userWorkspaceId: event.userWorkspaceId }
    : {}),
});

const groupEventsByAuthContext = (
  events: ObjectRecordEvent[],
): ObjectRecordEvent[][] => {
  const eventsByAuthContext = new Map<string, ObjectRecordEvent[]>();

  for (const event of events) {
    const authContextKey = `${event.userId ?? ''}:${event.userWorkspaceId ?? ''}`;
    const eventsSharingAuthContext = eventsByAuthContext.get(authContextKey);

    if (isDefined(eventsSharingAuthContext)) {
      eventsSharingAuthContext.push(event);
    } else {
      eventsByAuthContext.set(authContextKey, [event]);
    }
  }

  return [...eventsByAuthContext.values()];
};
