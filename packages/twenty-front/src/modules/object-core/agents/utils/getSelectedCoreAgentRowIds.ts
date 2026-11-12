import { EMPTY_CORE_AGENTS_SELECTION } from '@/object-core/agents/constants/EmptyCoreAgentsSelection';
import { type CoreAgentsSelection } from '@/object-core/agents/types/CoreAgentsSelection';
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
