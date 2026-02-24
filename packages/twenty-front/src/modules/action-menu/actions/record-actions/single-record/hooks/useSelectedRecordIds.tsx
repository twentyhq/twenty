import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useSelectedRecordIds = () => {
  const contextStoreTargetedRecordsRule = useAtomComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  if (
    contextStoreTargetedRecordsRule.mode === 'exclusion' ||
    (contextStoreTargetedRecordsRule.mode === 'selection' &&
      contextStoreTargetedRecordsRule.selectedRecordIds.length === 0)
  ) {
    return [];
  }

  return contextStoreTargetedRecordsRule.selectedRecordIds;
};
