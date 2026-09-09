import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import {
  EMPTY_CORE_WORKFLOWS_SELECTION,
  coreWorkflowsSelectionState,
} from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { getSelectedCoreWorkflowRowIds } from '@/object-core/workflows/utils/getSelectedCoreWorkflowRowIds';
import { toggleRowIdInSelection } from '@/object-core/utils/toggleRowIdInSelection';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCoreWorkflowsSelection = <
  TCoreWorkflow extends Pick<CoreWorkflow, 'id' | 'workspaceWorkflowId'>,
>({
  coreWorkflows,
}: {
  coreWorkflows: TCoreWorkflow[];
}) => {
  const [coreWorkflowsSelection, setCoreWorkflowsSelection] = useAtomState(
    coreWorkflowsSelectionState,
  );

  const [deletedCoreWorkflowIds, setDeletedCoreWorkflowIds] = useState<
    string[]
  >([]);

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  useEffect(
    () => () => setCoreWorkflowsSelection(EMPTY_CORE_WORKFLOWS_SELECTION),
    [setCoreWorkflowsSelection],
  );

  const selectedRowIds = getSelectedCoreWorkflowRowIds({
    selection: coreWorkflowsSelection,
    currentFilterSettings: coreWorkflowsFilterSettings,
  });

  const selectRows = (rowIds: string[]) =>
    setCoreWorkflowsSelection({
      filterSettings: coreWorkflowsFilterSettings,
      rowIds,
    });

  const displayedCoreWorkflows = coreWorkflows.filter(
    (coreWorkflow) => !deletedCoreWorkflowIds.includes(coreWorkflow.id),
  );

  const toggleRow = (rowId: string) =>
    selectRows(toggleRowIdInSelection({ selectedRowIds, rowId }));

  const forgetDeletedWorkspaceWorkflows = (
    deletedWorkspaceWorkflowIds: string[],
  ) => {
    const coreWorkflowIdsToForget = coreWorkflows
      .filter(
        (coreWorkflow) =>
          isDefined(coreWorkflow.workspaceWorkflowId) &&
          deletedWorkspaceWorkflowIds.includes(
            coreWorkflow.workspaceWorkflowId,
          ),
      )
      .map((coreWorkflow) => coreWorkflow.id);

    if (coreWorkflowIdsToForget.length === 0) {
      return;
    }

    setDeletedCoreWorkflowIds((previousDeletedCoreWorkflowIds) => [
      ...previousDeletedCoreWorkflowIds,
      ...coreWorkflowIdsToForget,
    ]);
    selectRows([]);
  };

  return {
    displayedCoreWorkflows,
    selectedRowIds,
    toggleRow,
    selectRows,
    forgetDeletedWorkspaceWorkflows,
  };
};
