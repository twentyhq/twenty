import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { BoardFieldDefinition } from '@/object-record/record-board-deprecated/types/BoardFieldDefinition';
import { ViewField } from '@/views/types/ViewField';

export const mapBoardFieldDefinitionsToViewFields = (
  fieldsDefinitions: BoardFieldDefinition<FieldMetadata>[],
): ViewField[] => {
  return fieldsDefinitions.map(
    (fieldDefinition): ViewField => ({
      id: fieldDefinition.viewFieldId || '',
      fieldMetadataId: fieldDefinition.fieldMetadataId,
      size: 0,
      position: fieldDefinition.position,
      isVisible: fieldDefinition.isVisible ?? true,
      definition: fieldDefinition,
    }),
  );
};
