import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isPlainObject } from 'twenty-shared/utils';

export const rebuildEventDiffFromRecords = <TEvent extends ObjectRecordEvent>(
  event: TEvent,
): TEvent => {
  const { properties } = event;

  if (!('diff' in properties) || !isPlainObject(properties.diff)) {
    return event;
  }

  const before =
    'before' in properties && isPlainObject(properties.before)
      ? properties.before
      : {};
  const after =
    'after' in properties && isPlainObject(properties.after)
      ? properties.after
      : {};

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
