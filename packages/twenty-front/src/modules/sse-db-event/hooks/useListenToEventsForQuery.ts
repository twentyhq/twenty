import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect, useRef } from 'react';
import { useRecoilCallback } from 'recoil';
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
  const operationSignatureRef = useRef(operationSignature);
  operationSignatureRef.current = operationSignature;

  const changeQueryIdListenState = useRecoilCallback(
    ({ set, snapshot }) =>
      (shouldListen: boolean, targetQueryId: string) => {
        const currentRequiredQueryListeners = getSnapshotValue(
          snapshot,
          requiredQueryListenersState,
        );

        const listeningForThisQueryIsActive =
          currentRequiredQueryListeners.some(
            (listener) => listener.queryId === targetQueryId,
          );

        if (shouldListen === listeningForThisQueryIsActive) {
          return;
        }

        if (shouldListen) {
          set(requiredQueryListenersState, [
            ...currentRequiredQueryListeners,
            {
              queryId: targetQueryId,
              operationSignature: operationSignatureRef.current,
            },
          ]);
        } else {
          set(
            requiredQueryListenersState,
            currentRequiredQueryListeners.filter(
              (listener) => listener.queryId !== targetQueryId,
            ),
          );
        }
      },
    [],
  );

  useEffect(() => {
    changeQueryIdListenState(true, queryId);

    return () => {
      changeQueryIdListenState(false, queryId);
    };
  }, [changeQueryIdListenState, queryId]);
};
