import { useState } from 'react';

import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { useDeleteCoreWorkflows } from '@/object-core/workflows/hooks/useDeleteCoreWorkflows';
import { getDeletableSelectedCoreWorkflows } from '@/object-core/workflows/utils/getDeletableSelectedCoreWorkflows';
import { toggleRowIdInSelection } from '@/object-core/utils/toggleRowIdInSelection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCoreWorkflowsSelection = <
  TCoreWorkflow extends Pick<CoreWorkflow, 'id' | 'workspaceWorkflowId'>,
>({
  coreWorkflows,
}: {
  coreWorkflows: TCoreWorkflow[];
}) => {
  const [selection, setSelection] = useState<{
    filterSettings: FilterSettings;
    rowIds: string[];
  }>({ filterSettings: {}, rowIds: [] });

  const [deletedCoreWorkflowIds, setDeletedCoreWorkflowIds] = useState<
    string[]
  >([]);

  const {
    deleteCoreWorkflows,
    canDeleteCoreWorkflows,
    isDeletingCoreWorkflows,
  } = useDeleteCoreWorkflows();

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const selectedRowIds =
    selection.filterSettings === coreWorkflowsFilterSettings
      ? selection.rowIds
      : [];

  const selectRows = (rowIds: string[]) =>
    setSelection({ filterSettings: coreWorkflowsFilterSettings, rowIds });

  const displayedCoreWorkflows = coreWorkflows.filter(
    (coreWorkflow) => !deletedCoreWorkflowIds.includes(coreWorkflow.id),
  );

  const deletableSelectedCoreWorkflows = getDeletableSelectedCoreWorkflows({
    coreWorkflows: displayedCoreWorkflows,
    selectedRowIds,
  });

  const selectedWorkspaceWorkflowIds = deletableSelectedCoreWorkflows.map(
    (deletableCoreWorkflow) => deletableCoreWorkflow.workspaceWorkflowId,
  );

  const toggleRow = (rowId: string) =>
    selectRows(toggleRowIdInSelection({ selectedRowIds, rowId }));

  const deleteSelectedCoreWorkflows = async () => {
    const coreWorkflowIdsToDelete = deletableSelectedCoreWorkflows.map(
      (deletableCoreWorkflow) => deletableCoreWorkflow.coreWorkflowId,
    );

    const hasDeleted = await deleteCoreWorkflows(selectedWorkspaceWorkflowIds);

    if (!hasDeleted) {
      return;
    }

    setDeletedCoreWorkflowIds((previousDeletedCoreWorkflowIds) => [
      ...previousDeletedCoreWorkflowIds,
      ...coreWorkflowIdsToDelete,
    ]);
    selectRows([]);
  };

  return {
    displayedCoreWorkflows,
    selectedRowIds,
    selectedWorkspaceWorkflowIds,
    toggleRow,
    selectRows,
    deleteSelectedCoreWorkflows,
    canDeleteCoreWorkflows,
    isDeletingCoreWorkflows,
  };
};
