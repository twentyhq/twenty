import chunk from 'lodash.chunk';

import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type LogicFunctionTriggerJobData } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { MAX_EVENTS_PER_TRIGGER_JOB } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/constants/max-events-per-trigger-job.constant';
import { findDatabaseEventTriggersMatchingEventName } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/find-database-event-triggers-matching-event-name';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { omitInheritedReadabilityChildRecords } from 'src/engine/core-modules/record-share/utils/omit-inherited-readability-child-records.util';
import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type TriggeredLogicFunction = Pick<
  LogicFunctionEntity,
  'id' | 'workspaceId' | 'databaseEventTriggerSettings'
>;

export const transformEventBatchToEventPayloads = ({
  workspaceEventBatch,
  logicFunctions,
}: {
  workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  logicFunctions: TriggeredLogicFunction[];
}): LogicFunctionTriggerJobData[] => {
  const result: LogicFunctionTriggerJobData[] = [];

  for (const logicFunction of logicFunctions) {
    // Each trigger stands on its own: a function listening on both
    // person.updated and *.updated receives a person update once per trigger
    const matchingTriggers = findDatabaseEventTriggersMatchingEventName({
      databaseEventTriggerSettings: logicFunction.databaseEventTriggerSettings,
      eventName: workspaceEventBatch.name,
    });

    for (const triggerSettings of matchingTriggers) {
      result.push(
        ...buildTriggerJobsData({
          workspaceEventBatch,
          logicFunction,
          triggerSettings,
        }),
      );
    }
  }

  return result;
};

const buildTriggerJobsData = ({
  workspaceEventBatch,
  logicFunction,
  triggerSettings,
}: {
  workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  logicFunction: TriggeredLogicFunction;
  triggerSettings: DatabaseEventTriggerSettings;
}): LogicFunctionTriggerJobData[] => {
  const { events, ...batchEventInfo } = workspaceEventBatch;
  const [, operation] = workspaceEventBatch.name.split('.');

  const filteredEvents = filterEventsByUpdatedFields({
    events,
    operation,
    triggerUpdatedFields: triggerSettings.updatedFields,
  });

  if (triggerSettings.batchMode !== true) {
    return filteredEvents.map((event) => ({
      logicFunctionId: logicFunction.id,
      workspaceId: logicFunction.workspaceId,
      payload: {
        ...batchEventInfo,
        ...omitInheritedReadabilityChildRecords(event),
      },
      ...buildAuthContext(event),
    }));
  }

  // A job carries a single auth context, so events acted by different users can never share one
  return groupEventsByAuthContext(filteredEvents).flatMap(
    (eventsSharingAuthContext) =>
      chunk(eventsSharingAuthContext, MAX_EVENTS_PER_TRIGGER_JOB).map(
        (eventsChunk) => ({
          logicFunctionId: logicFunction.id,
          workspaceId: logicFunction.workspaceId,
          payload: {
            ...batchEventInfo,
            events: eventsChunk.map(omitInheritedReadabilityChildRecords),
          },
          ...buildAuthContext(eventsChunk[0]),
        }),
      ),
  );
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
