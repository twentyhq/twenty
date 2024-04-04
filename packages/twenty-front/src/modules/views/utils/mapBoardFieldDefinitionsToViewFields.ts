import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ViewField } from '@/views/types/ViewField';

export const mapBoardFieldDefinitionsToViewFields = (
  fieldsDefinitions: RecordBoardFieldDefinition<FieldMetadata>[],
): ViewField[] => {
  return fieldsDefinitions.map(
    (fieldDefinition): ViewField => ({
      __typename: 'ViewField',
      id: fieldDefinition.viewFieldId || '',
      fieldMetadataId: fieldDefinition.fieldMetadataId,
      size: 0,
      position: fieldDefinition.position,
      isVisible: fieldDefinition.isVisible ?? true,
      definition: fieldDefinition,
    }),
  );
};
