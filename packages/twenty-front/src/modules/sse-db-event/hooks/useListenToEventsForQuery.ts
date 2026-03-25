import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { useCallback, useEffect } from 'react';
import {
  type MetadataGqlOperationSignature,
  type RecordGqlOperationSignature,
} from 'twenty-shared/types';
import { useStore } from 'jotai';

export const useListenToEventsForQuery = ({
  queryId,
  operationSignature,
}: {
  queryId: string;
  operationSignature:
    | RecordGqlOperationSignature
    | MetadataGqlOperationSignature;
}) => {
  const store = useStore();
  const changeQueryIdListenState = useCallback(
    (
      shouldListen: boolean,
      targetQueryId: string,
      targetOperationSignature:
        | RecordGqlOperationSignature
        | MetadataGqlOperationSignature,
    ) => {
      const currentRequiredQueryListeners = store.get(
        requiredQueryListenersState.atom,
      );

      const listeningForThisQueryIsActive = currentRequiredQueryListeners.some(
        (listener) => listener.queryId === targetQueryId,
      );

      if (shouldListen === listeningForThisQueryIsActive) {
        return;
      }

      if (shouldListen) {
        store.set(requiredQueryListenersState.atom, [
          ...currentRequiredQueryListeners,
          {
            queryId: targetQueryId,
            operationSignature: targetOperationSignature,
          },
        ]);
      } else {
        store.set(
          requiredQueryListenersState.atom,
          currentRequiredQueryListeners.filter(
            (listener) => listener.queryId !== targetQueryId,
          ),
        );
      }
    },
    [store],
  );

  useEffect(() => {
    changeQueryIdListenState(true, queryId, operationSignature);

    return () => {
      changeQueryIdListenState(false, queryId, operationSignature);
    };
  }, [changeQueryIdListenState, queryId, operationSignature]);
};
