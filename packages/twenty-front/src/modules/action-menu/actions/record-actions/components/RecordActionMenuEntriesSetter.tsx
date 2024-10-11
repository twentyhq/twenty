import { MultipleRecordsActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/MultipleRecordsActionMenuEntriesSetter';
import { SingleRecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/SingleRecordActionMenuEntriesSetter';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useRecoilValue } from 'recoil';

export const RecordActionMenuEntriesSetter = () => {
  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  if (contextStoreTargetedRecordIds.length === 0) {
    return null;
  }

  if (contextStoreTargetedRecordIds.length === 1) {
    return <SingleRecordActionMenuEntriesSetter />;
  }

  return <MultipleRecordsActionMenuEntriesSetter />;
};
