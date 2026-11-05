import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  type AiDataPolicyInput,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';

type WorkspacePrivacySettingsChanges = {
  aiDataPolicy?: AiDataPolicyInput;
  isProductImprovementDataSharingEnabled?: boolean;
};

export const useUpdateWorkspacePrivacySettings = () => {
  const { enqueueToast } = useToast();
  const store = useStore();
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const updateWorkspacePrivacySettings = async (
    changes: WorkspacePrivacySettingsChanges,
  ) => {
    const currentWorkspace = store.get(currentWorkspaceState.atom);

    if (!isDefined(currentWorkspace)) {
      return;
    }

    // only the failed fields roll back, so a concurrent save of another setting survives
    const previousValues: Partial<CurrentWorkspace> = Object.fromEntries(
      Object.keys(changes).map((key) => [
        key,
        currentWorkspace[key as keyof WorkspacePrivacySettingsChanges],
      ]),
    );

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
