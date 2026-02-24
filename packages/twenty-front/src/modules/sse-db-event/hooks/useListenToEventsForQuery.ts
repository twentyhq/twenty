import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback, useEffect } from 'react';
import {
  type MetadataGqlOperationSignature,
  type RecordGqlOperationSignature,
} from 'twenty-shared/types';

export const useListenToEventsForQuery = ({
  queryId,
  operationSignature,
}: {
  queryId: string;
  operationSignature:
    | RecordGqlOperationSignature
    | MetadataGqlOperationSignature;
}) => {
  const changeQueryIdListenState = useCallback(
    (
      shouldListen: boolean,
      targetQueryId: string,
      targetOperationSignature:
        | RecordGqlOperationSignature
        | MetadataGqlOperationSignature,
    ) => {
      const currentRequiredQueryListeners = jotaiStore.get(
        requiredQueryListenersState.atom,
      );

      const listeningForThisQueryIsActive = currentRequiredQueryListeners.some(
        (listener) => listener.queryId === targetQueryId,
      );

      if (shouldListen === listeningForThisQueryIsActive) {
        return;
      }

      if (shouldListen) {
        jotaiStore.set(requiredQueryListenersState.atom, [
          ...currentRequiredQueryListeners,
          {
            queryId: targetQueryId,
            operationSignature: targetOperationSignature,
          },
        ]);
      } else {
        jotaiStore.set(
          requiredQueryListenersState.atom,
          currentRequiredQueryListeners.filter(
            (listener) => listener.queryId !== targetQueryId,
          ),
        );
      }
    },
    [],
  );

  useEffect(() => {
    changeQueryIdListenState(true, queryId, operationSignature);

    return () => {
      changeQueryIdListenState(false, queryId, operationSignature);
    };
  }, [changeQueryIdListenState, queryId, operationSignature]);
};
