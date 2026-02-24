import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const isRecordBoardFetchingRecordsByColumnFamilyState =
  createFamilyState<boolean, RecordGroupDefinition['id']>({
    key: 'isRecordBoardFetchingRecordsByColumnFamilyState',
    defaultValue: false,
  });
