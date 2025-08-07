import { type SpreadsheetImportFields } from '@/spreadsheet-import/types';
import { type SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';

export const findUnmatchedRequiredFields = (
  fields: SpreadsheetImportFields,
  columns: SpreadsheetColumns,
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
