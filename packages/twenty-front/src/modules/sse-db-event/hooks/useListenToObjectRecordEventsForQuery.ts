import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { getObjectRecordEventsForQueryEventName } from '@/sse-db-event/utils/getObjectRecordEventsForQueryEventName';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { type RecordGqlOperationSignature } from 'twenty-shared/types';
import { type ObjectRecordEvent } from '~/generated/graphql';

export const useListenToObjectRecordEventsForQuery = ({
  queryId,
  operationSignature,
  onObjectRecordEvents,
}: {
  queryId: string;
  operationSignature: RecordGqlOperationSignature;
  onObjectRecordEvents: (objectRecordEvents: ObjectRecordEvent[]) => void;
}) => {
  useEffect(() => {
    const eventName = getObjectRecordEventsForQueryEventName(queryId);

    const handleOnObjectRecordEventsForQuery = (event: Event) => {
      const objectRecordEvents = (event as CustomEvent<ObjectRecordEvent[]>)
        .detail;

      onObjectRecordEvents(objectRecordEvents);
    };

    window.addEventListener(eventName, handleOnObjectRecordEventsForQuery);

    return () => {
      window.removeEventListener(eventName, handleOnObjectRecordEventsForQuery);
    };
  }, [onObjectRecordEvents, queryId]);

  const changeQueryIdListenState = useRecoilCallback(
    ({ set, snapshot }) =>
      (shouldListen: boolean, queryId: string) => {
        const currentRequiredQueryListeners = getSnapshotValue(
          snapshot,
          requiredQueryListenersState,
        );

        const listeningForThisQueryIsActive =
          currentRequiredQueryListeners.some(
            (listener) => listener.queryId === queryId,
          );

        if (shouldListen === listeningForThisQueryIsActive) {
          return;
        }

        if (shouldListen) {
          set(requiredQueryListenersState, [
            ...currentRequiredQueryListeners,
            { queryId, operationSignature },
          ]);
        } else {
          set(
            requiredQueryListenersState,
            currentRequiredQueryListeners.filter(
              (listener) => listener.queryId !== queryId,
            ),
          );
        }
      },
    [operationSignature],
  );

  useEffect(() => {
    changeQueryIdListenState(true, queryId);

    return () => {
      changeQueryIdListenState(false, queryId);
    };
  }, [changeQueryIdListenState, queryId]);
};
