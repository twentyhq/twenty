import { MultipleRecordsActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/MultipleRecordsActionMenuEntriesSetter';
import { SingleRecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/SingleRecordActionMenuEntriesSetter';
import { contextStoreNumberOfSelectedRecordsState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsState';
import { useRecoilValue } from 'recoil';

export const RecordActionMenuEntriesSetter = () => {
  const contextStoreNumberOfSelectedRecords = useRecoilValue(
    contextStoreNumberOfSelectedRecordsState,
  );

  if (!contextStoreNumberOfSelectedRecords) {
    return null;
  }

  if (contextStoreNumberOfSelectedRecords === 1) {
    return <SingleRecordActionMenuEntriesSetter />;
  }

  return <MultipleRecordsActionMenuEntriesSetter />;
};
