import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export type CoreAgentsSelection = {
  filterSettings: FilterSettings;
  rowIds: string[];
};

export const EMPTY_CORE_AGENTS_SELECTION: CoreAgentsSelection = {
  filterSettings: {},
  rowIds: [],
};

export const coreAgentsSelectionState = createAtomState<CoreAgentsSelection>({
  key: 'coreAgentsSelectionState',
  defaultValue: EMPTY_CORE_AGENTS_SELECTION,
});
