import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { atomFamily } from 'recoil';

export const isRecordBoardFetchingRecordsByColumnFamilyState = atomFamily<
  boolean,
  RecordGroupDefinition['id']
>({
  key: 'isRecordBoardFetchingRecordsByColumnFamilyState',
  default: false,
});
