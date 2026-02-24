import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFamilyAtomValue } from '@/ui/utilities/state/jotai/hooks/useFamilyAtomValue';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const usePageLayoutIdFromContextStoreTargetedRecord = () => {
  const targetedRecordsRule = useAtomComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  if (
    !(
      targetedRecordsRule.mode === 'selection' &&
      targetedRecordsRule.selectedRecordIds.length === 1
    )
  ) {
    throw new Error('Only one record should be selected');
  }

  const recordId: string = targetedRecordsRule.selectedRecordIds[0];

  const record = useFamilyAtomValue(recordStoreFamilyState, recordId);

  return { pageLayoutId: record?.pageLayoutId };
};
