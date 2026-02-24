import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const isRecordBoardFetchingRecordsByColumnFamilyState =
  createFamilyStateV2<boolean, RecordGroupDefinition['id']>({
    key: 'isRecordBoardFetchingRecordsByColumnFamilyState',
    defaultValue: false,
  });
