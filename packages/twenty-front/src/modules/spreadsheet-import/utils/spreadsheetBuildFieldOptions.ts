import { getFieldMetadataTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFieldMetadataTypeLabel';
import { SpreadsheetImportFields } from '@/spreadsheet-import/types';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { FieldMetadataType } from 'twenty-shared/types';

export const spreadsheetBuildFieldOptions = <T extends string>(
  fields: SpreadsheetImportFields<T>,
  columns: SpreadsheetColumns<string>,
) => {
  return fields
    .filter((field) => field.fieldMetadataType !== FieldMetadataType.RICH_TEXT)
    .map(({ Icon, label, key, fieldMetadataType }) => {
      const isSelected =
        columns.findIndex((column) => {
          if ('value' in column) {
            return column.value === key;
          }
          return false;
        }) !== -1;

      return {
        Icon: Icon,
        value: key,
        label: label,
        disabled: isSelected,
        fieldMetadataTypeLabel: getFieldMetadataTypeLabel(fieldMetadataType),
      } as const;
    });
};
