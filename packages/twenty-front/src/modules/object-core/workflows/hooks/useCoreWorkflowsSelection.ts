import { useEffect } from 'react';

import { useSelectedCoreWorkflowRowIds } from '@/object-core/workflows/hooks/useSelectedCoreWorkflowRowIds';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import {
  EMPTY_CORE_WORKFLOWS_SELECTION,
  coreWorkflowsSelectionState,
} from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { toggleRowIdInSelection } from '@/object-core/utils/toggleRowIdInSelection';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useCoreWorkflowsSelection = <
  TCoreWorkflow extends Pick<CoreWorkflow, 'id'>,
>({
  coreWorkflows,
  tableId,
}: {
  coreWorkflows: TCoreWorkflow[];
  tableId: string;
}) => {
  const setCoreWorkflowsSelection = useSetAtomState(
    coreWorkflowsSelectionState,
  );

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const sortedFieldByTable = useAtomFamilyStateValue(
    sortedFieldByTableFamilyState,
    { tableId },
  );

  useEffect(
    () => () => setCoreWorkflowsSelection(EMPTY_CORE_WORKFLOWS_SELECTION),
    [setCoreWorkflowsSelection],
  );

  const selectionRowIds = useSelectedCoreWorkflowRowIds();
  const selectedRowIds = selectionRowIds.filter((id) =>
    coreWorkflows.some((workflow) => workflow.id === id),
  );

  const selectRows = (rowIds: string[]) =>
    setCoreWorkflowsSelection({
      filterSettings: coreWorkflowsFilterSettings,
      tableId,
      sort: sortedFieldByTable,
      rowIds,
    });

  const toggleRow = (rowId: string) =>
    selectRows(
      toggleRowIdInSelection({ selectedRowIds: selectionRowIds, rowId }),
    );

  return {
    displayedCoreWorkflows: coreWorkflows,
    selectedRowIds,
    toggleRow,
    selectRows,
  };
};
