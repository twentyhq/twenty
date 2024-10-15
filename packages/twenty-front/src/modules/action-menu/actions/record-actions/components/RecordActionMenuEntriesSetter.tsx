import { MultipleRecordsActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/MultipleRecordsActionMenuEntriesSetter';
import { SingleRecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/SingleRecordActionMenuEntriesSetter';
import { contextStoreTargetedRecordsState } from '@/context-store/states/contextStoreTargetedRecordsState';
import { useRecoilValue } from 'recoil';

export const RecordActionMenuEntriesSetter = () => {
  const contextStoreTargetedRecords = useRecoilValue(
    contextStoreTargetedRecordsState,
  );

  if (contextStoreTargetedRecords.selectedRecordIds.length === 0) {
    return null;
  }

  if (contextStoreTargetedRecords.selectedRecordIds.length === 1) {
    return <SingleRecordActionMenuEntriesSetter />;
  }

  return <MultipleRecordsActionMenuEntriesSetter />;
};
