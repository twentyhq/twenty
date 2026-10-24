import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

export const cloneEventRecords = <TEvent extends ObjectRecordEvent>(
  event: TEvent,
): TEvent => {
  const { properties } = event;

  return {
    ...event,
    properties: {
      ...properties,
      ...('before' in properties &&
        isDefined(properties.before) && {
          before: { ...properties.before },
        }),
      ...('after' in properties &&
        isDefined(properties.after) && { after: { ...properties.after } }),
    },
  };
};
