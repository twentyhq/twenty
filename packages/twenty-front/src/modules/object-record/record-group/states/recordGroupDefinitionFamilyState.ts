import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { atomFamily } from 'recoil';

export const recordGroupDefinitionFamilyState = atomFamily<
  RecordGroupDefinition | undefined,
  RecordGroupDefinition['id']
>({
  key: 'recordGroupDefinitionFamilyState',
  default: undefined,
});
