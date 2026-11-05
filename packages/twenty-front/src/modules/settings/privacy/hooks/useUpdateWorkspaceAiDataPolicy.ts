import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { type AiDataPolicy } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const useUpdateWorkspaceAiDataPolicy = () => {
  const { enqueueToast } = useToast();
  const store = useStore();
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const updateWorkspaceAiDataPolicy = async (
    changes: Partial<AiDataPolicy>,
  ) => {
    const currentWorkspace = store.get(currentWorkspaceState.atom);

    if (!isDefined(currentWorkspace)) {
      return;
    }

    const previousAiDataPolicy = currentWorkspace.aiDataPolicy;
    const aiDataPolicy = {
      ...getWorkspaceAiDataPolicy(currentWorkspace),
      ...changes,
    };

    try {
      setCurrentWorkspace({ ...currentWorkspace, aiDataPolicy });
      await updateWorkspace({ variables: { input: { aiDataPolicy } } });
    } catch (error) {
      setCurrentWorkspace((workspace) =>
        isDefined(workspace)
          ? { ...workspace, aiDataPolicy: previousAiDataPolicy }
          : workspace,
      );
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { updateWorkspaceAiDataPolicy };
};
