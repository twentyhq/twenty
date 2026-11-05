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
let pendingAiDataPolicySaveCount = 0;
let confirmedAiDataPolicy: AiDataPolicy | null = null;

export const useUpdateWorkspaceAiDataPolicyField = () => {
  const { enqueueToast } = useToast();
  const store = useStore();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const setStoredAiDataPolicy = (aiDataPolicy: AiDataPolicy) =>
    store.set(currentWorkspaceState.atom, (workspace) =>
      isDefined(workspace) ? { ...workspace, aiDataPolicy } : workspace,
    );

  const readStoredAiDataPolicy = () =>
    getWorkspaceAiDataPolicy(store.get(currentWorkspaceState.atom));

  const updateWorkspaceAiDataPolicyField = <TField extends keyof AiDataPolicy>({
    field,
    value,
  }: {
    field: TField;
    value: AiDataPolicy[TField];
  }) => {
    const storedAiDataPolicy = readStoredAiDataPolicy();

    if (pendingAiDataPolicySaveCount === 0) {
      confirmedAiDataPolicy = storedAiDataPolicy;
    }

    pendingAiDataPolicySaveCount += 1;
    setStoredAiDataPolicy({ ...storedAiDataPolicy, [field]: value });

    lastAiDataPolicySave = lastAiDataPolicySave.then(async () => {
      const aiDataPolicy = readStoredAiDataPolicy();

      try {
        await updateWorkspace({ variables: { input: { aiDataPolicy } } });
        confirmedAiDataPolicy = aiDataPolicy;
      } catch (error) {
        setStoredAiDataPolicy({
          ...readStoredAiDataPolicy(),
          [field]: (confirmedAiDataPolicy ?? storedAiDataPolicy)[field],
        });
        enqueueToast(getToastOptionsFromError({ error }));
      } finally {
        pendingAiDataPolicySaveCount -= 1;
      }
    });

    return lastAiDataPolicySave;
  };

  return { updateWorkspaceAiDataPolicyField };
};
