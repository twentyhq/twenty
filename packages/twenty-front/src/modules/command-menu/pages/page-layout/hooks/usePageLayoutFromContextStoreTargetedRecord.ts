import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const usePageLayoutIdFromContextStoreTargetedRecord = () => {
  const targetedRecordsRule = useRecoilComponentValueV2(
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

  const record = useFamilyRecoilValueV2(recordStoreFamilyState, recordId);

  return { pageLayoutId: record?.pageLayoutId };
};
