import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

import { ViewField } from '../types/ViewField';

export const columnDefinitionToViewField = (
  columnDefinition: ColumnDefinition<FieldMetadata>,
): ViewField => {
  return {
    id: columnDefinition.key,
    fieldId: columnDefinition.key,
    position: columnDefinition.index,
    size: columnDefinition.size,
    isVisible: columnDefinition.isVisible ?? true,
  };
};
