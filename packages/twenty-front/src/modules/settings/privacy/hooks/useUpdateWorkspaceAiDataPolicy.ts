import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { type AiDataPolicy } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

// an update replaces the whole policy, so saves must reach the server one at a time
let lastAiDataPolicySave: Promise<void> = Promise.resolve();

export const useUpdateWorkspaceAiDataPolicy = () => {
  const { enqueueToast } = useToast();
  const store = useStore();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const setStoredAiDataPolicy = (aiDataPolicy: AiDataPolicy) =>
    store.set(currentWorkspaceState.atom, (workspace) =>
      isDefined(workspace) ? { ...workspace, aiDataPolicy } : workspace,
    );

  const readStoredAiDataPolicy = () =>
    getWorkspaceAiDataPolicy(store.get(currentWorkspaceState.atom));

  const updateWorkspaceAiDataPolicy = (changes: Partial<AiDataPolicy>) => {
    const previousAiDataPolicy = readStoredAiDataPolicy();

    setStoredAiDataPolicy({ ...previousAiDataPolicy, ...changes });

    lastAiDataPolicySave = lastAiDataPolicySave.then(async () => {
      try {
        await updateWorkspace({
          variables: { input: { aiDataPolicy: readStoredAiDataPolicy() } },
        });
      } catch (error) {
        setStoredAiDataPolicy(previousAiDataPolicy);
        enqueueToast(getToastOptionsFromError({ error }));
      }
    });

    return lastAiDataPolicySave;
  };

  return { updateWorkspaceAiDataPolicy };
};
