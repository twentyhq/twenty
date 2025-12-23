import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

import { type ViewField } from '@/views/types/ViewField';

export const mapColumnDefinitionsToViewFields = (
  columnDefinitions: ColumnDefinition<FieldMetadata>[],
): ViewField[] => {
  return columnDefinitions.map((columnDefinition) => ({
    __typename: 'ViewField',
    id: columnDefinition.viewFieldId || '',
    fieldMetadataId: columnDefinition.fieldMetadataId,
    position: columnDefinition.position,
    size: columnDefinition.size,
    isVisible: columnDefinition.isVisible ?? true,
    definition: columnDefinition,
  }));
};
