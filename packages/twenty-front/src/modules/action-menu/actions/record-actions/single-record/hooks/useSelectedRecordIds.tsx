import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const useSelectedRecordIds = () => {
  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
    recordIndexId,
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
