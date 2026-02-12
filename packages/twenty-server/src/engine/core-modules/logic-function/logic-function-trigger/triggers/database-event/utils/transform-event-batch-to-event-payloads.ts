import { isDefined } from 'twenty-shared/utils';

import type {
  DatabaseEventPayload,
  ObjectRecordEvent,
} from 'twenty-shared/database-events';

import { type LogicFunctionTriggerJobData } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export const transformEventBatchToEventPayloads = ({
  workspaceEventBatch,
  logicFunctions,
}: {
  workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  logicFunctions: Pick<
    LogicFunctionEntity,
    'id' | 'workspaceId' | 'databaseEventTriggerSettings'
  >[];
}): LogicFunctionTriggerJobData[] => {
  const result: LogicFunctionTriggerJobData[] = [];
  const { events, ...batchEventInfo } = workspaceEventBatch;
  const [, operation] = workspaceEventBatch.name.split('.');

  for (const logicFunction of logicFunctions) {
    const triggerUpdatedFields =
      logicFunction.databaseEventTriggerSettings?.updatedFields;

    const filteredEvents = filterEventsByUpdatedFields({
      events,
      operation,
      triggerUpdatedFields,
    });

    for (const event of filteredEvents) {
      const payload: DatabaseEventPayload = { ...batchEventInfo, ...event };

      result.push({
        logicFunctionId: logicFunction.id,
        workspaceId: logicFunction.workspaceId,
        payload,
      });
    }
  }

  return result;
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
  if (
    operation !== 'updated' ||
    !isDefined(triggerUpdatedFields) ||
    triggerUpdatedFields.length === 0
  ) {
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
