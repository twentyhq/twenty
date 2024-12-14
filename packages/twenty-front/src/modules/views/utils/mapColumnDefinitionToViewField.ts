import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

import { ViewField } from '../types/ViewField';

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
    aggregateOperation: columnDefinition.aggregateOperation,
  }));
};
