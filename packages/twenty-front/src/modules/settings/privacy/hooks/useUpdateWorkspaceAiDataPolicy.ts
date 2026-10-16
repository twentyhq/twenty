import { useMutation } from '@apollo/client/react';
import { type AiDataPolicy } from 'twenty-shared/ai';
import { useToast } from 'twenty-ui/components/feedback';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const useUpdateWorkspaceAiDataPolicy = () => {
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const updateWorkspaceAiDataPolicy = async (
    changes: Partial<AiDataPolicy>,
  ) => {
    if (!currentWorkspace) {
      return;
    }

    const previousWorkspace = currentWorkspace;

    try {
      setCurrentWorkspace({ ...currentWorkspace, ...changes });
      await updateWorkspace({ variables: { input: changes } });
    } catch (error) {
      setCurrentWorkspace(previousWorkspace);
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { updateWorkspaceAiDataPolicy };
};
