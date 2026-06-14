import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { useCallback } from 'react';
import {
  type MetadataGqlOperationSignature,
  type RecordGqlOperationSignature,
} from 'twenty-shared/types';
import { useStore } from 'jotai';

export const useChangeQueryListenState = () => {
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

  return { changeQueryIdListenState };
};
