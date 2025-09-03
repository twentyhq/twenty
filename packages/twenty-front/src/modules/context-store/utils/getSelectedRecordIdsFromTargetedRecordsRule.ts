import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';

export const getSelectedRecordIdsFromTargetedRecordsRule = (
  targetedRecordsRule: ContextStoreTargetedRecordsRule,
  allRecordIds: string[],
): string[] => {
  if (targetedRecordsRule.mode === 'selection') {
    return targetedRecordsRule.selectedRecordIds;
  }

  if (targetedRecordsRule.mode === 'exclusion') {
    // return all record ids except the excluded ones
    return allRecordIds.filter(
      (recordId) => !targetedRecordsRule.excludedRecordIds.includes(recordId),
    );
  }

  return [];
};
