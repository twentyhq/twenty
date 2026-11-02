import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { settingsAiWorkspaceInstructionsSaveFamilyState } from '@/settings/ai/states/settingsAiWorkspaceInstructionsSaveFamilyState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { useDebouncedCallback } from 'use-debounce';
import {
  PermissionFlagType,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';

const WORKSPACE_INSTRUCTIONS_SAVE_DEBOUNCE_MILLISECONDS = 1000;

export const useSettingsAiWorkspaceInstructions = () => {
  const { enqueueToast } = useToast();
  const store = useStore();
  const canEditInstructions = useHasPermissionFlag(
    PermissionFlagType.WORKSPACE,
  );
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const [draft, setDraft] = useState<{
    workspaceId: string;
    value: string;
  } | null>(null);
  const originalInstructions = currentWorkspace?.aiAdditionalInstructions ?? '';
  const workspaceInstructions =
    isDefined(draft) && draft.workspaceId === currentWorkspace?.id
      ? draft.value
      : originalInstructions;

  const autoSave = useDebouncedCallback(
    async ({
      newValue,
      workspaceId,
    }: {
      newValue: string;
      workspaceId: string;
    }) => {
      const workspaceAtDispatch = store.get(currentWorkspaceState.atom);

      if (!canEditInstructions || workspaceAtDispatch?.id !== workspaceId) {
        return;
      }

      const saveStateAtom =
        settingsAiWorkspaceInstructionsSaveFamilyState.atomFamily(workspaceId);
      const saveState = store.get(saveStateAtom);
      const savedInstructions =
        workspaceAtDispatch.aiAdditionalInstructions ?? '';
      const canSkipUnchangedSave =
        saveState.pendingRequestCount === 0 && newValue === savedInstructions;

      if (canSkipUnchangedSave) {
        setDraft((previousDraft) =>
          previousDraft?.workspaceId === workspaceId &&
          previousDraft.value === newValue
            ? null
            : previousDraft,
        );
        return;
      }

      const requestId = saveState.latestRequestId + 1;
      const pendingSave = Promise.resolve(saveState.pendingSave).then(
        async () => {
          try {
            const isActiveWorkspaceAtDispatch =
              store.get(currentWorkspaceState.atom)?.id === workspaceId;

            if (!isActiveWorkspaceAtDispatch) {
              return;
            }

            const { data } = await updateWorkspace({
              variables: {
                input: { aiAdditionalInstructions: newValue || null },
              },
            });
            const isActiveWorkspaceAtConfirmation =
              store.get(currentWorkspaceState.atom)?.id === workspaceId;

            if (
              data?.updateWorkspace.id !== workspaceId ||
              !isActiveWorkspaceAtConfirmation
            ) {
              return;
            }

            setCurrentWorkspace((previousWorkspace) =>
              previousWorkspace?.id === workspaceId
                ? {
                    ...previousWorkspace,
                    aiAdditionalInstructions: newValue || null,
                  }
                : previousWorkspace,
            );

            if (requestId === store.get(saveStateAtom).latestRequestId) {
              setDraft((previousDraft) =>
                previousDraft?.workspaceId === workspaceId &&
                previousDraft.value === newValue
                  ? null
                  : previousDraft,
              );
            }
          } catch (error) {
            const isLatestRequest =
              requestId === store.get(saveStateAtom).latestRequestId;
            const isActiveWorkspace =
              store.get(currentWorkspaceState.atom)?.id === workspaceId;

            if (!isLatestRequest || !isActiveWorkspace) {
              return;
            }

            if (CombinedGraphQLErrors.is(error)) {
              enqueueToast(getToastOptionsFromError({ error }));
              return;
            }

            enqueueToast({
              status: 'error',
              children: t`Failed to save workspace instructions`,
            });
          } finally {
            store.set(saveStateAtom, (previousSaveState) => ({
              ...previousSaveState,
              pendingRequestCount: previousSaveState.pendingRequestCount - 1,
              pendingSave:
                requestId === previousSaveState.latestRequestId
                  ? null
                  : previousSaveState.pendingSave,
            }));
          }
        },
      );

      store.set(saveStateAtom, {
        ...saveState,
        latestRequestId: requestId,
        pendingRequestCount: saveState.pendingRequestCount + 1,
        pendingSave,
      });
      await pendingSave;
    },
    WORKSPACE_INSTRUCTIONS_SAVE_DEBOUNCE_MILLISECONDS,
  );

  const handleInstructionsChange = (value: string) => {
    if (!canEditInstructions || !isDefined(currentWorkspace)) {
      return;
    }

    setDraft({ workspaceId: currentWorkspace.id, value });
    autoSave({ newValue: value, workspaceId: currentWorkspace.id });
  };

  return {
    canEditInstructions,
    workspaceInstructions,
    originalInstructions,
    handleInstructionsChange,
  };
};
