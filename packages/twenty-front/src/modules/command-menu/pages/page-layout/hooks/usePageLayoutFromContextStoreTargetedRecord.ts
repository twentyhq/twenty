import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const usePageLayoutIdFromContextStoreTargetedRecord = () => {
  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  if (
    !(
      contextStoreTargetedRecordsRule.mode === 'selection' &&
      contextStoreTargetedRecordsRule.selectedRecordIds.length === 1
    )
  ) {
    throw new Error('Only one recordStore should be selected');
  }

  const recordId: string = contextStoreTargetedRecordsRule.selectedRecordIds[0];

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  return { pageLayoutId: recordStore?.pageLayoutId };
};
