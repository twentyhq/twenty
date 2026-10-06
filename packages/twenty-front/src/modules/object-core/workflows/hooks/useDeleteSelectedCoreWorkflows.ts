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
import { invalidateCoreWorkflowQueries } from '@/object-core/workflows/utils/invalidateCoreWorkflowQueries';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useToast } from 'twenty-ui/components/feedback';
import {
  type DeleteCoreWorkflowsMutation,
  type DeleteCoreWorkflowsMutationVariables,
} from '~/generated/graphql';
import { logError } from '~/utils/logError';

export const useDeleteSelectedCoreWorkflows = () => {
  const apolloCoreClient = useApolloCoreClient();

  const coreWorkflowsSelection = useAtomStateValue(coreWorkflowsSelectionState);
  const setCoreWorkflowsSelection = useSetAtomState(
    coreWorkflowsSelectionState,
  );

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const { enqueueToast } = useToast();

  const [deleteCoreWorkflowsMutation] = useMutation<
    DeleteCoreWorkflowsMutation,
    DeleteCoreWorkflowsMutationVariables
  >(DELETE_CORE_WORKFLOWS, { client: apolloCoreClient });

  const selectedCoreWorkflowIds = getSelectedCoreWorkflowRowIds({
    selection: coreWorkflowsSelection,
    currentFilterSettings: coreWorkflowsFilterSettings,
  });

  const deleteSelectedCoreWorkflows = async (
    coreWorkflowIds = selectedCoreWorkflowIds,
  ) => {
    if (!isNonEmptyArray(coreWorkflowIds)) {
      return false;
    }

    let deletedCoreWorkflows: NonNullable<
      DeleteCoreWorkflowsMutation['deleteCoreWorkflows']
    >;

    try {
      const { data } = await deleteCoreWorkflowsMutation({
        variables: { input: { coreWorkflowIds } },
      });

      deletedCoreWorkflows = data?.deleteCoreWorkflows ?? [];
    } catch (error) {
      logError(error);
      enqueueToast({
        variant: 'error',
        children: t`Failed to delete workflows`,
      });

      return false;
    }

    if (!isNonEmptyArray(deletedCoreWorkflows)) {
      enqueueToast({
        variant: 'error',
        children: t`No workflows were deleted`,
      });

      return false;
    }

    setCoreWorkflowsSelection(EMPTY_CORE_WORKFLOWS_SELECTION);

    void invalidateCoreWorkflowQueries(apolloCoreClient).catch(logError);

    return true;
  };

  return { deleteSelectedCoreWorkflows, selectedCoreWorkflowIds };
};
