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

const filterEventsByUpdatedFields = ({
  events,
  operation,
  triggerUpdatedFields,
}: {
  events: ObjectRecordEvent[];
  operation: string;
  triggerUpdatedFields?: string[];
}): ObjectRecordEvent[] => {
  // Upserted events carry the same before/after-derived `updatedFields` as
  // updated events (see formatTwentyOrmEventToDatabaseBatchEvent), so a
  // trigger's watched-fields filter applies to both operations. Without
  // this, an upserted trigger fires on every write regardless of which
  // fields changed, which is surprising and can cause self-triggering
  // loops when a logic function upserts back into the same record.
  if (operation !== 'updated' && operation !== 'upserted') {
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
