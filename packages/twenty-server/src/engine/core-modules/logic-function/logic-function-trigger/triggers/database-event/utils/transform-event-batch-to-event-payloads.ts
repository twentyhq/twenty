import chunk from 'lodash.chunk';

import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type LogicFunctionTriggerJobData } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { MAX_EVENTS_PER_TRIGGER_JOB } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/constants/max-events-per-trigger-job.constant';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export const transformEventBatchToEventPayloads = ({
  workspaceEventBatch,
  logicFunctions,
  maxBatchSize,
}: {
  workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  logicFunctions: Pick<
    LogicFunctionEntity,
    'id' | 'workspaceId' | 'databaseEventTriggerSettings'
  >[];
  maxBatchSize?: number;
}): LogicFunctionTriggerJobData[] => {
  const result: LogicFunctionTriggerJobData[] = [];
  const { events, ...batchEventInfo } = workspaceEventBatch;
  const [, operation] = workspaceEventBatch.name.split('.');

  for (const logicFunction of logicFunctions) {
    const triggerSettings = logicFunction.databaseEventTriggerSettings;

    const filteredEvents = filterEventsByUpdatedFields({
      events,
      operation,
      triggerUpdatedFields: triggerSettings?.updatedFields,
    });

    if (triggerSettings?.batchMode !== true) {
      for (const event of filteredEvents) {
        result.push({
          logicFunctionId: logicFunction.id,
          workspaceId: logicFunction.workspaceId,
          payload: { ...batchEventInfo, ...event },
          ...buildAuthContext(event),
        });
      }

      continue;
    }

    const eventsPerJob = resolveEventsPerJob(maxBatchSize);

    // A job carries a single auth context, so events acted by different users can never share one
    for (const eventsSharingAuthContext of groupEventsByAuthContext(
      filteredEvents,
    )) {
      for (const eventsChunk of chunk(eventsSharingAuthContext, eventsPerJob)) {
        result.push({
          logicFunctionId: logicFunction.id,
          workspaceId: logicFunction.workspaceId,
          payload: { ...batchEventInfo, events: eventsChunk },
          ...buildAuthContext(eventsChunk[0]),
        });
      }
    }
  }

  return result;
};

const resolveEventsPerJob = (maxBatchSize?: number): number =>
  Math.max(
    1,
    Math.min(
      isDefined(maxBatchSize)
        ? Math.floor(maxBatchSize)
        : MAX_EVENTS_PER_TRIGGER_JOB,
      MAX_EVENTS_PER_TRIGGER_JOB,
    ),
  );

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

const filterEventsByUpdatedFields = ({
  events,
  operation,
  triggerUpdatedFields,
}: {
  events: ObjectRecordEvent[];
  operation: string;
  triggerUpdatedFields?: string[];
}): ObjectRecordEvent[] => {
  if (operation !== 'updated') {
    return events;
  }

  if (!isDefined(triggerUpdatedFields) || triggerUpdatedFields.length === 0) {
    return events;
  }

  return events.filter((event) => {
    const eventUpdatedFields = (
      event.properties as { updatedFields?: string[] }
    )?.updatedFields;

    if (!isDefined(eventUpdatedFields) || eventUpdatedFields.length === 0) {
      return false;
    }

    return eventUpdatedFields.some((fieldName: string) =>
      triggerUpdatedFields.includes(fieldName),
    );
  });
};
