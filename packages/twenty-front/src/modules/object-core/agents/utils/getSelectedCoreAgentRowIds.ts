import {
  EMPTY_CORE_AGENTS_SELECTION,
  type CoreAgentsSelection,
} from '@/object-core/agents/states/coreAgentsSelectionState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const getSelectedCoreAgentRowIds = ({
  selection,
  currentFilterSettings,
}: {
  selection: CoreAgentsSelection;
  currentFilterSettings: FilterSettings;
}): string[] =>
  selection.filterSettings === currentFilterSettings
    ? selection.rowIds
    : EMPTY_CORE_AGENTS_SELECTION.rowIds;
