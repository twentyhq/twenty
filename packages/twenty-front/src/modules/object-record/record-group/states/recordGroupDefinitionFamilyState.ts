import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

export const recordGroupDefinitionFamilyState = createFamilyStateV2<
  RecordGroupDefinition | undefined,
  RecordGroupDefinition['id']
>({
  key: 'recordGroupDefinitionFamilyState',
  defaultValue: undefined,
});
