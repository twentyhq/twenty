import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { useDeleteCoreWorkflows } from '@/object-core/workflows/hooks/useDeleteCoreWorkflows';
import { getSelectedWorkspaceWorkflowIds } from '@/object-core/workflows/utils/getSelectedWorkspaceWorkflowIds';
import { toggleRowIdInSelection } from '@/object-core/utils/toggleRowIdInSelection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCoreWorkflowsSelection = ({
  coreWorkflows,
}: {
  coreWorkflows: CoreWorkflow[];
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

  const selectedWorkspaceWorkflowIds = getSelectedWorkspaceWorkflowIds({
    coreWorkflows: displayedCoreWorkflows,
    selectedRowIds,
  });

  const toggleRow = (rowId: string) =>
    selectRows(toggleRowIdInSelection({ selectedRowIds, rowId }));

  const deleteSelectedCoreWorkflows = async () => {
    const coreWorkflowIdsToDelete = displayedCoreWorkflows
      .filter(
        (coreWorkflow) =>
          selectedRowIds.includes(coreWorkflow.id) &&
          isDefined(coreWorkflow.workspaceWorkflowId),
      )
      .map((coreWorkflow) => coreWorkflow.id);

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
