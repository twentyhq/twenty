import { connectionCheckFamilyState } from '@/settings/applications/states/connectionCheckFamilyState';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { RunConnectionCheckDocument } from '~/generated-metadata/graphql';

export const useRunConnectionCheck = () => {
  const store = useStore();

  const [runConnectionCheckMutation] = useMutation(RunConnectionCheckDocument);

  const runConnectionCheck = useCallback(
    async (connectedAccountId: string) => {
      const connectionCheckAtom =
        connectionCheckFamilyState.atomFamily(connectedAccountId);
      const runId = v4();

      store.set(connectionCheckAtom, (previousConnectionCheck) => ({
        runId,
        result: previousConnectionCheck.result,
      }));

      // A check that cannot run leaves the connection looking connected, as before.
      const response = await runConnectionCheckMutation({
        variables: { connectedAccountId },
      }).catch(() => undefined);

      if (store.get(connectionCheckAtom).runId !== runId) {
        return;
      }

      store.set(connectionCheckAtom, {
        runId,
        result: response?.data?.runConnectionCheck ?? null,
      });
    },
    [runConnectionCheckMutation, store],
  );

  return { runConnectionCheck };
};
