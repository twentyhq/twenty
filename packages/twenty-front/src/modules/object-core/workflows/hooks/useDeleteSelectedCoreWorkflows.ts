import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { useRemoveNavigationMenuItemByTargetRecordId } from '@/navigation-menu-item/common/hooks/useRemoveNavigationMenuItemByTargetRecordId';
import { DELETE_CORE_WORKFLOWS } from '@/object-core/workflows/graphql/mutations/deleteCoreWorkflows';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import {
  EMPTY_CORE_WORKFLOWS_SELECTION,
  coreWorkflowsSelectionState,
} from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { getSelectedCoreWorkflowRowIds } from '@/object-core/workflows/utils/getSelectedCoreWorkflowRowIds';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/feedback';
import {
  type DeleteCoreWorkflowsMutation,
  type DeleteCoreWorkflowsMutationVariables,
} from '~/generated/graphql';
import { logError } from '~/utils/logError';

export const useDeleteSelectedCoreWorkflows = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const coreWorkflowsSelection = useAtomStateValue(coreWorkflowsSelectionState);
  const setCoreWorkflowsSelection = useSetAtomState(
    coreWorkflowsSelectionState,
  );

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const { removeNavigationMenuItemsByTargetRecordIds } =
    useRemoveNavigationMenuItemByTargetRecordId();

  const { add: addToast } = useToast();

  const [deleteCoreWorkflowsMutation] = useMutation<
    DeleteCoreWorkflowsMutation,
    DeleteCoreWorkflowsMutationVariables
  >(DELETE_CORE_WORKFLOWS, { client: apolloCoreClient });

  const selectedCoreWorkflowIds = getSelectedCoreWorkflowRowIds({
    selection: coreWorkflowsSelection,
    currentFilterSettings: coreWorkflowsFilterSettings,
  });

  const deleteSelectedCoreWorkflows = async () => {
    if (!isNonEmptyArray(selectedCoreWorkflowIds)) {
      return;
    }

    let deletedWorkspaceWorkflowIds: string[];

    try {
      const { data } = await deleteCoreWorkflowsMutation({
        variables: { input: { coreWorkflowIds: selectedCoreWorkflowIds } },
      });

      deletedWorkspaceWorkflowIds = (data?.deleteCoreWorkflows ?? []).map(
        (deletedCoreWorkflow) => deletedCoreWorkflow.workspaceWorkflowId,
      );
    } catch (error) {
      logError(error);
      addToast({ variant: 'error', children: t`Failed to delete workflows` });

      return;
    }

    if (!isNonEmptyArray(deletedWorkspaceWorkflowIds)) {
      addToast({ variant: 'error', children: t`No workflows were deleted` });

      return;
    }

    setCoreWorkflowsSelection(EMPTY_CORE_WORKFLOWS_SELECTION);

    removeNavigationMenuItemsByTargetRecordIds(deletedWorkspaceWorkflowIds);

    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem,
      operation: {
        type: 'delete-many',
        deletedRecordIds: deletedWorkspaceWorkflowIds,
      },
    });
  };

  return { deleteSelectedCoreWorkflows, selectedCoreWorkflowIds };
};
