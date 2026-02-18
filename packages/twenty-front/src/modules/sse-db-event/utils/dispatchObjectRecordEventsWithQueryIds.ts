import { type ObjectRecordEventsByQueryId } from '@/sse-db-event/types/ObjectRecordEventsByQueryId';
import { getObjectRecordEventsForQueryEventName } from '@/sse-db-event/utils/getObjectRecordEventsForQueryEventName';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectRecordEventWithQueryIds } from '~/generated-metadata/graphql';

export const dispatchObjectRecordEventsWithQueryIds = (
  objectRecordEventsWithQueryIds: ObjectRecordEventWithQueryIds[],
) => {
  const objectRecordEventsByQueryId: ObjectRecordEventsByQueryId = {};

  for (const item of objectRecordEventsWithQueryIds) {
    for (const queryId of item.queryIds) {
      if (!isDefined(objectRecordEventsByQueryId[queryId])) {
        objectRecordEventsByQueryId[queryId] = [];
      }

      objectRecordEventsByQueryId[queryId].push(item.objectRecordEvent);
    }
  }

  for (const queryId in objectRecordEventsByQueryId) {
    window.dispatchEvent(
      new CustomEvent(getObjectRecordEventsForQueryEventName(queryId), {
        detail: objectRecordEventsByQueryId[queryId],
      }),
    );
  }
};
