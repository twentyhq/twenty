import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
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
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const [deletedWorkspaceWorkflowIds, setDeletedWorkspaceWorkflowIds] =
    useState<string[]>([]);

  const {
    deleteCoreWorkflows,
    canDeleteCoreWorkflows,
    isDeletingCoreWorkflows,
  } = useDeleteCoreWorkflows();

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  useEffect(() => {
    setSelectedRowIds([]);
  }, [coreWorkflowsFilterSettings]);

  const displayedCoreWorkflows = coreWorkflows.filter(
    (coreWorkflow) =>
      !isDefined(coreWorkflow.workspaceWorkflowId) ||
      !deletedWorkspaceWorkflowIds.includes(coreWorkflow.workspaceWorkflowId),
  );

  const selectedWorkspaceWorkflowIds = getSelectedWorkspaceWorkflowIds({
    coreWorkflows: displayedCoreWorkflows,
    selectedRowIds,
  });

  const toggleRow = (rowId: string) =>
    setSelectedRowIds((previousSelectedRowIds) =>
      toggleRowIdInSelection({ selectedRowIds: previousSelectedRowIds, rowId }),
    );

  const deleteSelectedCoreWorkflows = async () => {
    const workspaceWorkflowIdsToDelete = selectedWorkspaceWorkflowIds;

    const hasDeleted = await deleteCoreWorkflows(workspaceWorkflowIdsToDelete);

    if (!hasDeleted) {
      return;
    }

    setDeletedWorkspaceWorkflowIds((previousDeletedWorkspaceWorkflowIds) => [
      ...previousDeletedWorkspaceWorkflowIds,
      ...workspaceWorkflowIdsToDelete,
    ]);
    setSelectedRowIds([]);
  };

  return {
    displayedCoreWorkflows,
    selectedRowIds,
    selectedWorkspaceWorkflowIds,
    toggleRow,
    selectRows: setSelectedRowIds,
    deleteSelectedCoreWorkflows,
    canDeleteCoreWorkflows,
    isDeletingCoreWorkflows,
  };
};
