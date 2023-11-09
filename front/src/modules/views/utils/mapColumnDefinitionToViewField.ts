import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';

import { ViewField } from '../types/ViewField';

export const mapColumnDefinitionsToViewFields = (
  columnDefinitions: ColumnDefinition<FieldMetadata>[],
): ViewField[] => {
  return columnDefinitions.map((columnDefinition) => ({
    id: columnDefinition.viewFieldId || '',
    fieldMetadataId: columnDefinition.fieldMetadataId,
    position: columnDefinition.position,
    size: columnDefinition.size,
    isVisible: columnDefinition.isVisible ?? true,
    definition: columnDefinition,
  }));
};
