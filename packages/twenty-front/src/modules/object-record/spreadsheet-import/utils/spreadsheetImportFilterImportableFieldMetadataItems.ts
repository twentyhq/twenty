import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type SpreadsheetImportFields } from '@/spreadsheet-import/types';

export const spreadsheetImportFilterImportableFieldMetadataItems = ({
  fieldMetadataItems,
  spreadsheetImportFields,
}: {
  fieldMetadataItems: FieldMetadataItem[];
  spreadsheetImportFields: SpreadsheetImportFields;
}) => {
  const importableFieldMetadataItemIds = new Set(
    spreadsheetImportFields.map(
      (spreadsheetImportField) => spreadsheetImportField.fieldMetadataItemId,
    ),
  );

  return fieldMetadataItems.filter((fieldMetadataItem) =>
    importableFieldMetadataItemIds.has(fieldMetadataItem.id),
  );
};
