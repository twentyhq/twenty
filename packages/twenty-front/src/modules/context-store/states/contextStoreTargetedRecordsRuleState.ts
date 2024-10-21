import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { createState } from 'twenty-ui';

type ContextStoreTargetedRecordsRuleSelectionMode = {
  mode: 'selection';
  selectedRecordIds: string[];
};

type ContextStoreTargetedRecordsRuleExclusionMode = {
  mode: 'exclusion';
  excludedRecordIds: string[];
  filters: Filter[];
};

export type ContextStoreTargetedRecordsRule =
  | ContextStoreTargetedRecordsRuleSelectionMode
  | ContextStoreTargetedRecordsRuleExclusionMode;

export const contextStoreTargetedRecordsRuleState =
  createState<ContextStoreTargetedRecordsRule>({
    key: 'contextStoreTargetedRecordsRuleState',
    defaultValue: {
      mode: 'selection',
      selectedRecordIds: [],
    },
  });
