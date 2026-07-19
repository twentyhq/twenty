import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

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
      const payload = { ...batchEventInfo, ...event };

      result.push({
        logicFunctionId: logicFunction.id,
        workspaceId: logicFunction.workspaceId,
        payload,
      });
    }
  }

  return result;
};

const isFieldFilterableDatabaseEventOperation = (
  operation: string,
): boolean => operation === 'updated' || operation === 'upserted';

// Aligns with the classic workflow listener: field-scope both `updated` and
// `upserted`. Pure-create upserts (no before-record / empty updatedFields) still
// pass so first-time processing is not dropped; update-path upserts whose
// changed fields do not intersect the watched set are filtered out.
const filterEventsByUpdatedFields = ({
  events,
  operation,
  triggerUpdatedFields,
}: {
  events: ObjectRecordEvent[];
  operation: string;
  triggerUpdatedFields?: string[];
}): ObjectRecordEvent[] => {
  if (!isFieldFilterableDatabaseEventOperation(operation)) {
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
      // Pure create path of an upsert has no field diff — keep it.
      // For plain `updated`, empty updatedFields means nothing to match.
      return operation === 'upserted';
    }

    return eventUpdatedFields.some((fieldName: string) =>
      triggerUpdatedFields.includes(fieldName),
    );
  });
};
