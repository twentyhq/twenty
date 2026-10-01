import { type CoreWorkflowsSelection } from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const getSelectedCoreWorkflowRowIds = ({
  selection,
  currentFilterSettings,
  currentSort,
}: {
  selection: CoreWorkflowsSelection;
  currentFilterSettings: FilterSettings;
  currentSort: TableSortValue | null;
}): string[] =>
  selection.filterSettings === currentFilterSettings &&
  selection.sort === currentSort
    ? selection.rowIds
    : [];
