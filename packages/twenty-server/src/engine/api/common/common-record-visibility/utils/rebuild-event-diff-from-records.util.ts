import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isPlainObject } from 'twenty-shared/utils';

export const rebuildEventDiffFromRecords = <TEvent extends ObjectRecordEvent>(
  event: TEvent,
): TEvent => {
  const properties: Record<string, unknown> = { ...event.properties };

  if (!isPlainObject(properties.diff)) {
    return event;
  }

  const before = isPlainObject(properties.before) ? properties.before : {};
  const after = isPlainObject(properties.after) ? properties.after : {};

  return {
    ...event,
    properties: {
      ...properties,
      diff: Object.fromEntries(
        Object.entries(properties.diff).map(([fieldName, fieldDiff]) => [
          fieldName,
          isPlainObject(fieldDiff)
            ? {
                ...fieldDiff,
                ...(fieldName in before && { before: before[fieldName] }),
                ...(fieldName in after && { after: after[fieldName] }),
              }
            : fieldDiff,
        ]),
      ),
    },
  };
};
