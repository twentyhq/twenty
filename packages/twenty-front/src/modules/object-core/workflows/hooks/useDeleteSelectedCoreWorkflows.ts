import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { DELETE_CORE_WORKFLOWS } from '@/object-core/workflows/graphql/mutations/deleteCoreWorkflows';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import {
  EMPTY_CORE_WORKFLOWS_SELECTION,
  coreWorkflowsSelectionState,
} from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { getSelectedCoreWorkflowRowIds } from '@/object-core/workflows/utils/getSelectedCoreWorkflowRowIds';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  type DeleteCoreWorkflowsMutation,
  type DeleteCoreWorkflowsMutationVariables,
} from '~/generated/graphql';
import { logError } from '~/utils/logError';

export const useDeleteSelectedCoreWorkflows = () => {
  const apolloCoreClient = useApolloCoreClient();

  const selection = useAtomStateValue(coreWorkflowsSelectionState);
  const setSelection = useSetAtomState(coreWorkflowsSelectionState);

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const { enqueueErrorSnackBar } = useSnackBar();

  const [deleteCoreWorkflowsMutation] = useMutation<
    DeleteCoreWorkflowsMutation,
    DeleteCoreWorkflowsMutationVariables
  >(DELETE_CORE_WORKFLOWS, { client: apolloCoreClient });

  const selectedCoreWorkflowIds = getSelectedCoreWorkflowRowIds({
    selection,
    currentFilterSettings: coreWorkflowsFilterSettings,
  });

  const deleteSelectedCoreWorkflows = async () => {
    if (!isNonEmptyArray(selectedCoreWorkflowIds)) {
      return;
    }

    try {
      await deleteCoreWorkflowsMutation({
        variables: { input: { coreWorkflowIds: selectedCoreWorkflowIds } },
      });
    } catch (error) {
      logError(error);
      enqueueErrorSnackBar({ message: t`Failed to delete workflows` });

      return;
    }

    setSelection(EMPTY_CORE_WORKFLOWS_SELECTION);

    await apolloCoreClient.refetchQueries({ include: ['GetCoreWorkflows'] });
  };

  return { deleteSelectedCoreWorkflows, selectedCoreWorkflowIds };
};
