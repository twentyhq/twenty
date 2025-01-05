import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

export const useSortRecordByView = (
  visibleTableColumns: ColumnDefinition<FieldMetadata>[],
  fieldMetadataItems: FieldMetadataItem[],
) => {
  const orderedFields = visibleTableColumns
    .map((column) =>
      fieldMetadataItems.find((item) => item.id === column.fieldMetadataId),
    )
    .filter((fieldMetadataItem): fieldMetadataItem is FieldMetadataItem =>
      Boolean(fieldMetadataItem),
    );

  const remainingFields = fieldMetadataItems
    .filter(
      (item) =>
        !visibleTableColumns.some(
          (column) => column.fieldMetadataId === item.id,
        ),
    )
    .sort((a, b) => a.label.localeCompare(b.label));

  return { orderedFields, remainingFields };
};
