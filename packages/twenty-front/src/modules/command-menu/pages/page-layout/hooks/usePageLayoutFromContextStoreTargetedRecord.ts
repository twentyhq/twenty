import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';

export const usePageLayoutIdFromContextStoreTargetedRecord = () => {
  const targetedRecordsRule = useRecoilComponentValue(
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

  const record = useRecoilValue(recordStoreFamilyState(recordId));

  return { pageLayoutId: record?.pageLayoutId };
};
