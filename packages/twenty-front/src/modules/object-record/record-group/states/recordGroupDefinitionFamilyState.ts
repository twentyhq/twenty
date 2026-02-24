import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

export const recordGroupDefinitionFamilyState = createFamilyState<
  RecordGroupDefinition | undefined,
  RecordGroupDefinition['id']
>({
  key: 'recordGroupDefinitionFamilyState',
  defaultValue: undefined,
});
