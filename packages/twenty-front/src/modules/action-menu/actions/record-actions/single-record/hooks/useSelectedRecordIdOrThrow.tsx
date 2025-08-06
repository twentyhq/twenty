import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useSelectedRecordIdOrThrow = () => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
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
