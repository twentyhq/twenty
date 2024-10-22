import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { ViewGroup } from '@/views/types/ViewGroup';

export const mapRecordGroupDefinitionsToViewGroups = (
  groupDefinitions: RecordGroupDefinition[],
): ViewGroup[] => {
  return groupDefinitions.map(
    (groupDefinition): ViewGroup => ({
      __typename: 'ViewGroup',
      id: groupDefinition.id || '',
      // TODO: This should be a fieldMetadataId
      fieldMetadataId: '',
      position: groupDefinition.position,
      isVisible: groupDefinition.isVisible ?? true,
      fieldValue: groupDefinition.value ?? '',
    }),
  );
};
