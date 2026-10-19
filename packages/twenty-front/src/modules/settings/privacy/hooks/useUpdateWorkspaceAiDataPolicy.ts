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

    // only the failed fields roll back, so a concurrent save of the other setting survives
    const previousValues = {
      ...('aiDataResidency' in changes
        ? { aiDataResidency: currentWorkspace.aiDataResidency }
        : {}),
      ...('isAiZeroDataRetentionRequired' in changes
        ? {
            isAiZeroDataRetentionRequired:
              currentWorkspace.isAiZeroDataRetentionRequired,
          }
        : {}),
    };

    try {
      setCurrentWorkspace({ ...currentWorkspace, ...changes });
      await updateWorkspace({ variables: { input: changes } });
    } catch (error) {
      setCurrentWorkspace((workspace) =>
        workspace === null ? workspace : { ...workspace, ...previousValues },
      );
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { updateWorkspaceAiDataPolicy };
};
