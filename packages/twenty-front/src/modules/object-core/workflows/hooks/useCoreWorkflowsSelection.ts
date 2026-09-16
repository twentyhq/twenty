import { useEffect } from 'react';

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
  TCoreWorkflow extends Pick<CoreWorkflow, 'id'>,
>({
  coreWorkflows,
  loading = false,
}: {
  coreWorkflows: TCoreWorkflow[];
  loading?: boolean;
}) => {
  const [coreWorkflowsSelection, setCoreWorkflowsSelection] = useAtomState(
    coreWorkflowsSelectionState,
  );

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  useEffect(
    () => () => setCoreWorkflowsSelection(EMPTY_CORE_WORKFLOWS_SELECTION),
    [setCoreWorkflowsSelection],
  );

  const selectionRowIds = getSelectedCoreWorkflowRowIds({
    selection: coreWorkflowsSelection,
    currentFilterSettings: coreWorkflowsFilterSettings,
  });
  const selectedRowIds = selectionRowIds.filter((id) =>
    coreWorkflows.some((workflow) => workflow.id === id),
  );

  useEffect(() => {
    if (!loading && selectedRowIds.length !== selectionRowIds.length) {
      setCoreWorkflowsSelection({
        ...coreWorkflowsSelection,
        rowIds: selectedRowIds,
      });
    }
  }, [
    loading,
    selectedRowIds,
    selectionRowIds,
    coreWorkflowsSelection,
    setCoreWorkflowsSelection,
  ]);

  const selectRows = (rowIds: string[]) =>
    setCoreWorkflowsSelection({
      filterSettings: coreWorkflowsFilterSettings,
      rowIds,
    });

  const toggleRow = (rowId: string) =>
    selectRows(toggleRowIdInSelection({ selectedRowIds, rowId }));

  return {
    displayedCoreWorkflows: coreWorkflows,
    selectedRowIds,
    toggleRow,
    selectRows,
  };
};
