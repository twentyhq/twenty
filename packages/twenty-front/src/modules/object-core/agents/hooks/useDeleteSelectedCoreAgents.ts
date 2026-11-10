import { useApolloClient, useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { EMPTY_CORE_AGENTS_SELECTION } from '@/object-core/agents/constants/EmptyCoreAgentsSelection';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { coreAgentsSelectionState } from '@/object-core/agents/states/coreAgentsSelectionState';
import { getSelectedCoreAgentRowIds } from '@/object-core/agents/utils/getSelectedCoreAgentRowIds';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  DeleteOneAgentDocument,
  FindManyAgentsDocument,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useDeleteSelectedCoreAgents = () => {
  const { t } = useLingui();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const [deleteOneAgent] = useMutation(DeleteOneAgentDocument);

  const [coreAgentsSelection, setCoreAgentsSelection] = useAtomState(
    coreAgentsSelectionState,
  );
  const coreAgentsFilterSettings = useAtomStateValue(
    coreAgentsFilterSettingsState,
  );

  const selectedCoreAgentIds = getSelectedCoreAgentRowIds({
    selection: coreAgentsSelection,
    currentFilterSettings: coreAgentsFilterSettings,
  });

  const deleteSelectedCoreAgents = async () => {
    if (!isNonEmptyArray(selectedCoreAgentIds)) {
      return false;
    }

    const deletionErrors: unknown[] = [];

    for (const coreAgentId of selectedCoreAgentIds) {
      try {
        await deleteOneAgent({ variables: { input: { id: coreAgentId } } });
      } catch (error) {
        deletionErrors.push(error);
      }
    }

    setCoreAgentsSelection(EMPTY_CORE_AGENTS_SELECTION);

    void apolloClient
      .refetchQueries({ include: [FindManyAgentsDocument] })
      .catch(logError);

    const [firstDeletionError] = deletionErrors;

    if (isDefined(firstDeletionError)) {
      const deletionErrorCount = deletionErrors.length;
      const selectedCoreAgentCount = selectedCoreAgentIds.length;

      enqueueToast(
        getToastOptionsFromError({
          error: firstDeletionError,
          children:
            deletionErrorCount > 1
              ? t`Failed to delete ${deletionErrorCount} of ${selectedCoreAgentCount} agents`
              : undefined,
        }),
      );

      return false;
    }

    return true;
  };

  return { deleteSelectedCoreAgents, selectedCoreAgentIds };
};
