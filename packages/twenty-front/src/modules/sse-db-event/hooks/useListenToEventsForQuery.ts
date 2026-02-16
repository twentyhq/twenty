import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

export const useListenToEventsForQuery = ({
  queryId,
  operationSignature,
}: {
  queryId: string;
  operationSignature: Record<string, unknown>;
}) => {
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
