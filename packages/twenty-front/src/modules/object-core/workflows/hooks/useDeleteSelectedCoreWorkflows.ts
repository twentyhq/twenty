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
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/primitives/feedback';
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

  const { enqueueToast } = useToast();

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

    let deletedCoreWorkflows: NonNullable<
      DeleteCoreWorkflowsMutation['deleteCoreWorkflows']
    >;

    try {
      const { data } = await deleteCoreWorkflowsMutation({
        variables: { input: { coreWorkflowIds: selectedCoreWorkflowIds } },
      });

      deletedCoreWorkflows = data?.deleteCoreWorkflows ?? [];
    } catch (error) {
      logError(error);
      enqueueToast({
        variant: 'error',
        children: t`Failed to delete workflows`,
      });

      return;
    }

    if (!isNonEmptyArray(deletedCoreWorkflows)) {
      enqueueToast({
        variant: 'error',
        children: t`No workflows were deleted`,
      });

      return;
    }

    setCoreWorkflowsSelection(EMPTY_CORE_WORKFLOWS_SELECTION);

    const deletedCoreWorkflowIds = deletedCoreWorkflows.map(
      (deletedCoreWorkflow) => deletedCoreWorkflow.id,
    );
    const deletedWorkspaceWorkflowIds = deletedCoreWorkflows.map(
      (deletedCoreWorkflow) => deletedCoreWorkflow.workspaceWorkflowId,
    );

    for (const coreWorkflowId of deletedCoreWorkflowIds) {
      apolloCoreClient.cache.evict({
        id: apolloCoreClient.cache.identify({
          __typename: 'CoreWorkflowDTO',
          id: coreWorkflowId,
        }),
      });
    }
    await invalidateCoreWorkflowVersions(apolloCoreClient);

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
