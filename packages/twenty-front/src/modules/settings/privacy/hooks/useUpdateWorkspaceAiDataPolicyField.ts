import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { type AiDataPolicy } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { pendingAiDataPolicyState } from '@/settings/privacy/states/pendingAiDataPolicyState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const useUpdateWorkspaceAiDataPolicyField = () => {
  const { enqueueToast } = useToast();
  const store = useStore();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const setStoredAiDataPolicy = (aiDataPolicy: AiDataPolicy) =>
    store.set(currentWorkspaceState.atom, (workspace) =>
      isDefined(workspace) ? { ...workspace, aiDataPolicy } : workspace,
    );

  const saveAiDataPolicy = async ({
    aiDataPolicy,
    lastSavedAiDataPolicy,
  }: {
    aiDataPolicy: AiDataPolicy;
    lastSavedAiDataPolicy: AiDataPolicy;
  }): Promise<void> => {
    try {
      await updateWorkspace({ variables: { input: { aiDataPolicy } } });
    } catch (error) {
      store.set(pendingAiDataPolicyState.atom, null);
      setStoredAiDataPolicy(lastSavedAiDataPolicy);
      enqueueToast(getToastOptionsFromError({ error }));

      return;
    }

    const pendingAiDataPolicy = store.get(pendingAiDataPolicyState.atom);

    if (
      !isDefined(pendingAiDataPolicy) ||
      pendingAiDataPolicy === aiDataPolicy
    ) {
      store.set(pendingAiDataPolicyState.atom, null);

      return;
    }

    await saveAiDataPolicy({
      aiDataPolicy: pendingAiDataPolicy,
      lastSavedAiDataPolicy: aiDataPolicy,
    });
  };

  const updateWorkspaceAiDataPolicyField = async <
    TField extends keyof AiDataPolicy,
  >({
    field,
    value,
  }: {
    field: TField;
    value: AiDataPolicy[TField];
  }) => {
    const storedAiDataPolicy = getWorkspaceAiDataPolicy(
      store.get(currentWorkspaceState.atom),
    );
    const pendingAiDataPolicy = store.get(pendingAiDataPolicyState.atom);
    const aiDataPolicy = {
      ...(pendingAiDataPolicy ?? storedAiDataPolicy),
      [field]: value,
    };

    store.set(pendingAiDataPolicyState.atom, aiDataPolicy);
    setStoredAiDataPolicy(aiDataPolicy);

    // an update replaces the whole policy, so a save in flight sends this one when it lands
    if (!isDefined(pendingAiDataPolicy)) {
      await saveAiDataPolicy({
        aiDataPolicy,
        lastSavedAiDataPolicy: storedAiDataPolicy,
      });
    }
  };

  return { updateWorkspaceAiDataPolicyField };
};
