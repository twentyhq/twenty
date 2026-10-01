import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export type CoreWorkflowsSelection = {
  filterSettings: FilterSettings;
  rowIds: string[];
};

export const EMPTY_CORE_WORKFLOWS_SELECTION: CoreWorkflowsSelection = {
  filterSettings: {},
  rowIds: [],
};

export const coreWorkflowsSelectionState =
  createAtomState<CoreWorkflowsSelection>({
    key: 'coreWorkflowsSelectionState',
    defaultValue: EMPTY_CORE_WORKFLOWS_SELECTION,
  });
