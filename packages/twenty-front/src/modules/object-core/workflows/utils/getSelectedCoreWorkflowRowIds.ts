import { type CoreWorkflowsSelection } from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const getSelectedCoreWorkflowRowIds = ({
  selection,
  currentFilterSettings,
}: {
  selection: CoreWorkflowsSelection;
  currentFilterSettings: FilterSettings;
}): string[] =>
  selection.filterSettings === currentFilterSettings ? selection.rowIds : [];
