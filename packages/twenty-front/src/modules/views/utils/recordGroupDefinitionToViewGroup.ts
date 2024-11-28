import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { ViewGroup } from '@/views/types/ViewGroup';

export const recordGroupDefinitionToViewGroup = (
  recordGroup: RecordGroupDefinition,
): ViewGroup => {
  return {
    __typename: 'ViewGroup',
    id: recordGroup.id,
    fieldMetadataId: recordGroup.fieldMetadataId,
    position: recordGroup.position,
    isVisible: recordGroup.isVisible ?? true,
    fieldValue: recordGroup.value ?? '',
  };
};
