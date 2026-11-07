import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { type AiDataPolicy } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { isAiDataPolicySavingState } from '@/settings/privacy/states/isAiDataPolicySavingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const useUpdateWorkspaceAiDataPolicyField = () => {
  const { enqueueToast } = useToast();
  const store = useStore();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const isAiDataPolicySaving = useAtomStateValue(isAiDataPolicySavingState);

  const setStoredAiDataPolicy = (aiDataPolicy: AiDataPolicy) =>
    store.set(currentWorkspaceState.atom, (workspace) =>
      isDefined(workspace) ? { ...workspace, aiDataPolicy } : workspace,
    );

  // an update replaces the whole policy, so the controls stay disabled until it lands
  const updateWorkspaceAiDataPolicyField = async <
    TField extends keyof AiDataPolicy,
  >({
    field,
    value,
  }: {
    field: TField;
    value: AiDataPolicy[TField];
  }) => {
    const previousAiDataPolicy = getWorkspaceAiDataPolicy(
      store.get(currentWorkspaceState.atom),
    );
    const aiDataPolicy = { ...previousAiDataPolicy, [field]: value };

    store.set(isAiDataPolicySavingState.atom, true);
    setStoredAiDataPolicy(aiDataPolicy);

    try {
      await updateWorkspace({ variables: { input: { aiDataPolicy } } });
    } catch (error) {
      setStoredAiDataPolicy(previousAiDataPolicy);
      enqueueToast(getToastOptionsFromError({ error }));
    } finally {
      store.set(isAiDataPolicySavingState.atom, false);
    }
  };

  return { updateWorkspaceAiDataPolicyField, isAiDataPolicySaving };
};
