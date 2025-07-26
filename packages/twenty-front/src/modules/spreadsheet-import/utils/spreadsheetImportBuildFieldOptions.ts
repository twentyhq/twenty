import { getFieldMetadataTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFieldMetadataTypeLabel';
import { SpreadsheetImportFields } from '@/spreadsheet-import/types';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetImportFieldOption } from '@/spreadsheet-import/types/SpreadsheetImportFieldOption';
import { getShortNestedFieldLabel } from '@/spreadsheet-import/utils/getShortNestedFieldLabel';
import { ReadonlyDeep } from 'type-fest';

export const spreadsheetImportBuildFieldOptions = (
  fields: SpreadsheetImportFields,
  columns: SpreadsheetColumns,
): readonly ReadonlyDeep<SpreadsheetImportFieldOption>[] => {
  return fields.map(
    ({
      Icon,
      label,
      key,
      fieldMetadataType,
      isNestedField,
      fieldMetadataItemId,
    }) => {
      const isSelected = columns.some((column) => {
        if ('value' in column) {
          return column.value === key;
        }
        return false;
      });

      return {
        Icon: Icon,
        value: key,
        label,
        shortLabelForNestedField: isNestedField
          ? getShortNestedFieldLabel(label)
          : undefined,
        disabled: isSelected,
        fieldMetadataTypeLabel: getFieldMetadataTypeLabel(fieldMetadataType),
        isNestedField: isNestedField,
        fieldMetadataItemId: fieldMetadataItemId,
      };
    },
  );
};
