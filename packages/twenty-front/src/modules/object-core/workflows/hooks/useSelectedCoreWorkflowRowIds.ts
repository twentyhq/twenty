import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { coreWorkflowsSelectionState } from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { getSelectedCoreWorkflowRowIds } from '@/object-core/workflows/utils/getSelectedCoreWorkflowRowIds';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSelectedCoreWorkflowRowIds = () => {
  const coreWorkflowsSelection = useAtomStateValue(coreWorkflowsSelectionState);

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const sortedFieldByTable = useAtomFamilyStateValue(
    sortedFieldByTableFamilyState,
    { tableId: coreWorkflowsSelection.tableId },
  );

  return getSelectedCoreWorkflowRowIds({
    selection: coreWorkflowsSelection,
    currentFilterSettings: coreWorkflowsFilterSettings,
    currentSort: sortedFieldByTable,
  });
};
