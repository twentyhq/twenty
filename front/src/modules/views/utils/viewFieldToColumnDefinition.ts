import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

import { ViewField } from '../types/ViewField';

export const viewFieldToColumnDefinition = (
  viewField: ViewField,
  availableColumnDefinitions: ColumnDefinition<FieldMetadata>[],
): ColumnDefinition<FieldMetadata> | null => {
  const columnDefinition = availableColumnDefinitions.find(
    ({ key }) => viewField.fieldId === key,
  );

  return columnDefinition
    ? {
        ...columnDefinition,
        key: viewField.fieldId,
        name: viewField.fieldId,
        index: viewField.position,
        size: viewField.size ?? columnDefinition.size,
        isVisible: viewField.isVisible,
      }
    : null;
};
