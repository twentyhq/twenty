import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useToast } from 'twenty-ui/components/feedback';
import { v4 } from 'uuid';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { coreAgentAvatarPendingUpdatesFamilyState } from '@/object-core/agents/states/coreAgentAvatarPendingUpdatesFamilyState';
import { type CoreAgentAvatarPatch } from '@/object-core/agents/types/CoreAgentAvatarPatch';
import { enqueueCoreAgentAvatarSave } from '@/object-core/agents/utils/enqueueCoreAgentAvatarSave';
import { UpdateOneAgentDocument } from '~/generated-metadata/graphql';

export const useSaveCoreAgentAvatar = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();

  const saveCoreAgentAvatar = ({
    agentId,
    patch,
  }: {
    agentId: string;
    patch: CoreAgentAvatarPatch;
  }) => {
    const updateId = v4();
    const pendingUpdatesAtom =
      coreAgentAvatarPendingUpdatesFamilyState.atomFamily(agentId);

    store.set(pendingUpdatesAtom, (updates) => [
      ...updates,
      { id: updateId, patch },
    ]);

    return enqueueCoreAgentAvatarSave({
      scope: store,
      agentId,
      save: async () => {
        try {
          await client.mutate({
            mutation: UpdateOneAgentDocument,
            variables: { input: { id: agentId, ...patch } },
            errorPolicy: 'none',
          });
        } catch (error) {
          enqueueToast(getToastOptionsFromError({ error }));
        } finally {
          store.set(pendingUpdatesAtom, (updates) =>
            updates.filter(({ id }) => id !== updateId),
          );
        }
      },
    });
  };

  return { saveCoreAgentAvatar };
};
