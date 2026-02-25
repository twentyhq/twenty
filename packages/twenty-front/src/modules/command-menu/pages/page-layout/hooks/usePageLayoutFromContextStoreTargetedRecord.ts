import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const usePageLayoutIdFromContextStoreTargetedRecord = () => {
  const targetedRecordsRule = useAtomComponentStateValue(
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

  const record = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  return { pageLayoutId: record?.pageLayoutId };
};
