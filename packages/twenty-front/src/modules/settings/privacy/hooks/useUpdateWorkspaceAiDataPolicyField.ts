import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { type AiDataPolicy } from 'twenty-shared/ai';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { isAiDataPolicySavingState } from '@/settings/privacy/states/isAiDataPolicySavingState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const useUpdateWorkspaceAiDataPolicyField = () => {
  const { enqueueToast } = useToast();
  const store = useStore();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const getStoredAiDataPolicy = () =>
    getWorkspaceAiDataPolicy(store.get(currentWorkspaceState.atom));

  const setStoredAiDataPolicy = (aiDataPolicy: AiDataPolicy) =>
    store.set(currentWorkspaceState.atom, (workspace) =>
      isDefined(workspace) ? { ...workspace, aiDataPolicy } : workspace,
    );

  const updateWorkspaceAiDataPolicyField = async <
    TField extends keyof AiDataPolicy,
  >({
    field,
    value,
  }: {
    field: TField;
    value: AiDataPolicy[TField];
  }) => {
    let lastSavedAiDataPolicy = getStoredAiDataPolicy();

    setStoredAiDataPolicy({ ...lastSavedAiDataPolicy, [field]: value });

    // an update replaces the whole policy, so only one runs at a time and it resends whatever changed meanwhile
    if (store.get(isAiDataPolicySavingState.atom)) {
      return;
    }

    store.set(isAiDataPolicySavingState.atom, true);

    let saveError: unknown;
    let sentAiDataPolicy: AiDataPolicy;

    do {
      sentAiDataPolicy = getStoredAiDataPolicy();

      try {
        await updateWorkspace({
          variables: { input: { aiDataPolicy: sentAiDataPolicy } },
        });
        lastSavedAiDataPolicy = sentAiDataPolicy;
        saveError = undefined;
      } catch (error) {
        saveError = error;
      }
    } while (!fastDeepEqual(getStoredAiDataPolicy(), sentAiDataPolicy));

    store.set(isAiDataPolicySavingState.atom, false);

    if (isDefined(saveError)) {
      setStoredAiDataPolicy(lastSavedAiDataPolicy);
      enqueueToast(getToastOptionsFromError({ error: saveError }));
    }
  };

  return { updateWorkspaceAiDataPolicyField };
};
