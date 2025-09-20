import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type SpreadsheetImportFieldOption } from '@/spreadsheet-import/types/SpreadsheetImportFieldOption';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const getSubFieldOptions = (
  fieldMetadataItem: FieldMetadataItem,
  options: readonly Readonly<SpreadsheetImportFieldOption>[],
  searchFilter: string,
): readonly Readonly<SpreadsheetImportFieldOption>[] => {
  return options.filter((option) => {
    const searchNormalized = normalizeSearchText(searchFilter);
    return (
      option.fieldMetadataItemId === fieldMetadataItem.id &&
      normalizeSearchText(option.label).includes(searchNormalized)
    );
  });
};
