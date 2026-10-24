import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isPlainObject } from 'twenty-shared/utils';

export const cloneEventRecords = <TEvent extends ObjectRecordEvent>(
  event: TEvent,
): TEvent => {
  const properties: Record<string, unknown> = { ...event.properties };

  return {
    ...event,
    properties: {
      ...properties,
      ...(isPlainObject(properties.before) && {
        before: { ...properties.before },
      }),
      ...(isPlainObject(properties.after) && {
        after: { ...properties.after },
      }),
    },
  };
};
