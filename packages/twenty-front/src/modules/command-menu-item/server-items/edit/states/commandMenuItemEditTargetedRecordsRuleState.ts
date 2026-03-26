import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const commandMenuItemEditTargetedRecordsRuleState =
  createAtomState<ContextStoreTargetedRecordsRule>({
    key: 'commandMenuItemEditTargetedRecordsRuleState',
    defaultValue: {
      mode: 'selection',
      selectedRecordIds: [],
    },
  });
