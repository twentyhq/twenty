import { SpreadsheetImportFields } from '@/spreadsheet-import/types';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';

export const findUnmatchedRequiredFields = <T extends string>(
  fields: SpreadsheetImportFields<T>,
  columns: SpreadsheetColumns<T>,
) =>
  fields
    .filter((field) =>
      field.fieldValidationDefinitions?.some(
        (validation) => validation.rule === 'required',
      ),
    )
    .filter(
      (field) =>
        columns.findIndex(
          (column) => 'value' in column && column.value === field.key,
        ) === -1,
    )
    .map((field) => field.label) || [];
