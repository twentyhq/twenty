import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useSelectedRecordIdOrThrow = () => {
  const contextStoreTargetedRecordsRule = useAtomComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  if (
    contextStoreTargetedRecordsRule.mode === 'exclusion' ||
    (contextStoreTargetedRecordsRule.mode === 'selection' &&
      contextStoreTargetedRecordsRule.selectedRecordIds.length === 0)
  ) {
    throw new Error('Selected record ID is required');
  }

  return contextStoreTargetedRecordsRule.selectedRecordIds[0];
};
