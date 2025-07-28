import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SpreadsheetImportFieldOption } from '@/spreadsheet-import/types/SpreadsheetImportFieldOption';

export const getSubFieldOptions = (
  fieldMetadataItem: FieldMetadataItem,
  options: readonly Readonly<SpreadsheetImportFieldOption>[],
  searchFilter: string,
): readonly Readonly<SpreadsheetImportFieldOption>[] => {
  return options.filter(
    (option) =>
      option.fieldMetadataItemId === fieldMetadataItem.id &&
      option.label.toLowerCase().includes(searchFilter.toLowerCase()),
  );
};
