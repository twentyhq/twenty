import { MultipleRecordsActions } from '@/action-menu/actions/record-actions/components/MultipleRecordsActions';
import { SingleRecordActions } from '@/action-menu/actions/record-actions/components/SingleRecordActions';
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
    return <SingleRecordActions />;
  }

  return <MultipleRecordsActions />;
};
