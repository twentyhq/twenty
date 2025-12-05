import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { type ViewGroup } from '@/views/types/ViewGroup';

export const recordGroupDefinitionToViewGroup = (
  recordGroup: RecordGroupDefinition,
): ViewGroup => {
  return {
    __typename: 'ViewGroup',
    id: recordGroup.id,
    position: recordGroup.position,
    isVisible: recordGroup.isVisible ?? true,
    fieldValue: recordGroup.value ?? '',
  };
};
