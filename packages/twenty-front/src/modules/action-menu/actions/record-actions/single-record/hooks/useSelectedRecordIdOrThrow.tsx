import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-ui';

export const useSelectedRecordIdOrThrow = (recordId?: string) => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  if (isDefined(recordId)) {
    return recordId;
  }

  if (
    contextStoreTargetedRecordsRule.mode === 'exclusion' ||
    (contextStoreTargetedRecordsRule.mode === 'selection' &&
      contextStoreTargetedRecordsRule.selectedRecordIds.length === 0)
  ) {
    throw new Error('Selected record ID is required');
  }

  return contextStoreTargetedRecordsRule.selectedRecordIds[0];
};
