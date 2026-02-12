import { type ObjectRecordEventsByQueryId } from '@/sse-db-event/types/ObjectRecordEventsByQueryId';
import { getObjectRecordEventsForQueryEventName } from '@/sse-db-event/utils/getObjectRecordEventsForQueryEventName';
import { isDefined } from 'twenty-shared/utils';
import { type EventWithQueryIds } from '~/generated-metadata/graphql';

export const dispatchObjectRecordEventsWithQueryIds = (
  objectRecordEventsWithQueryIds: EventWithQueryIds[],
) => {
  const objectRecordEventsByQueryId: ObjectRecordEventsByQueryId = {};

  for (const objectRecordEventWithQueryIds of objectRecordEventsWithQueryIds) {
    for (const queryId of objectRecordEventWithQueryIds.queryIds) {
      if (!isDefined(objectRecordEventsByQueryId[queryId])) {
        objectRecordEventsByQueryId[queryId] = [];
      }

      objectRecordEventsByQueryId[queryId].push(
        objectRecordEventWithQueryIds.event,
      );
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
