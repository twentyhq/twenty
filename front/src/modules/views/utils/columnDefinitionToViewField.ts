import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

import { ViewField } from '../types/ViewField';

export const columnDefinitionsToViewFields = (
  columnDefinitions: ColumnDefinition<FieldMetadata>[],
): ViewField[] => {
  return columnDefinitions.map((columnDefinition) => ({
    id: columnDefinition.viewFieldId || '',
    fieldId: columnDefinition.fieldId,
    position: columnDefinition.position,
    size: columnDefinition.size,
    isVisible: columnDefinition.isVisible ?? true,
  }));
};
