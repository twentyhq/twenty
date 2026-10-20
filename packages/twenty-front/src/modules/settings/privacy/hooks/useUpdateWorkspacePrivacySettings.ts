import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

type WorkspacePrivacySettings = Pick<
  CurrentWorkspace,
  | 'aiDataResidency'
  | 'isAiZeroDataRetentionRequired'
  | 'isProductImprovementDataSharingEnabled'
>;

export const useUpdateWorkspacePrivacySettings = () => {
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const updateWorkspacePrivacySettings = async (
    changes: Partial<WorkspacePrivacySettings>,
  ) => {
    if (!isDefined(currentWorkspace)) {
      return;
    }

    // only the failed fields roll back, so a concurrent save of another setting survives
    const previousValues: Partial<WorkspacePrivacySettings> = {
      ...('aiDataResidency' in changes
        ? { aiDataResidency: currentWorkspace.aiDataResidency }
        : {}),
      ...('isAiZeroDataRetentionRequired' in changes
        ? {
            isAiZeroDataRetentionRequired:
              currentWorkspace.isAiZeroDataRetentionRequired,
          }
        : {}),
      ...('isProductImprovementDataSharingEnabled' in changes
        ? {
            isProductImprovementDataSharingEnabled:
              currentWorkspace.isProductImprovementDataSharingEnabled,
          }
        : {}),
    };

    try {
      setCurrentWorkspace({ ...currentWorkspace, ...changes });
      await updateWorkspace({ variables: { input: changes } });
    } catch (error) {
      setCurrentWorkspace((workspace) =>
        isDefined(workspace) ? { ...workspace, ...previousValues } : workspace,
      );
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { updateWorkspacePrivacySettings };
};
