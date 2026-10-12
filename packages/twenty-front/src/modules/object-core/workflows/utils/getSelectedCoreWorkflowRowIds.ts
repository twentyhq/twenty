import {
  EMPTY_CORE_WORKFLOWS_SELECTION,
  type CoreWorkflowsSelection,
} from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const getSelectedCoreWorkflowRowIds = ({
  selection,
  currentFilterSettings,
}: {
  selection: CoreWorkflowsSelection;
  currentFilterSettings: FilterSettings;
}): string[] =>
  selection.filterSettings === currentFilterSettings
    ? selection.rowIds
    : EMPTY_CORE_WORKFLOWS_SELECTION.rowIds;
