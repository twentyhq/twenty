import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

type ContextStoreTargetedRecordsRuleSelectionMode = {
  mode: 'selection';
  selectedRecordIds: string[];
};

type ContextStoreTargetedRecordsRuleExclusionMode = {
  mode: 'exclusion';
  excludedRecordIds: string[];
};

export type ContextStoreTargetedRecordsRule =
  | ContextStoreTargetedRecordsRuleSelectionMode
  | ContextStoreTargetedRecordsRuleExclusionMode;

export const contextStoreTargetedRecordsRuleComponentState =
  createAtomComponentState<ContextStoreTargetedRecordsRule>({
    key: 'contextStoreTargetedRecordsRuleComponentState',
    defaultValue: {
      mode: 'selection',
      selectedRecordIds: [],
    },
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
