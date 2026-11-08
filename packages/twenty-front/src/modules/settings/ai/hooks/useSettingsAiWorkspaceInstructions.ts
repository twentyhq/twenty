import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { useDebouncedCallback } from 'use-debounce';
import {
  PermissionFlagType,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';

export const useSettingsAiWorkspaceInstructions = () => {
  const { enqueueToast } = useToast();
  const canEditInstructions = useHasPermissionFlag(
    PermissionFlagType.WORKSPACE,
  );
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const autoSave = useDebouncedCallback(async (newValue: string) => {
    if (!canEditInstructions) {
      return;
    }

    const aiAdditionalInstructions = newValue || null;

    try {
      await updateWorkspace({
        variables: { input: { aiAdditionalInstructions } },
      });
      setCurrentWorkspace((previousWorkspace) =>
        isDefined(previousWorkspace)
          ? { ...previousWorkspace, aiAdditionalInstructions }
          : previousWorkspace,
      );
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  }, 1_000);

  return {
    canEditInstructions,
    workspaceInstructions: currentWorkspace?.aiAdditionalInstructions ?? '',
    handleInstructionsChange: autoSave,
  };
};
