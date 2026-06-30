import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const isRecordBoardFetchingRecordsByColumnFamilyState =
  createAtomFamilyState<boolean, RecordGroupDefinition['id']>({
    key: 'isRecordBoardFetchingRecordsByColumnFamilyState',
    defaultValue: false,
  });
