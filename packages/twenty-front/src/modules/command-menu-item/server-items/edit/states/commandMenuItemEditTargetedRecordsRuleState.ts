import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const commandMenuItemEditTargetedRecordsRuleState =
  createAtomComponentState<ContextStoreTargetedRecordsRule>({
    key: 'commandMenuItemEditTargetedRecordsRuleState',
    defaultValue: {
      mode: 'selection',
      selectedRecordIds: [],
    },
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
