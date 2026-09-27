import { type ImportedStructuredRowMetadata } from '@/spreadsheet-import/steps/components/ValidationStep/types';
import { type ImportedStructuredRow } from '@/spreadsheet-import/types';
import { type Column } from 'react-data-grid';
import {
  type SpreadsheetColumns,
  SpreadsheetColumnType,
} from 'twenty-shared/utils';

const IMPORTED_COLUMN_TYPES = [
  SpreadsheetColumnType.matched,
  SpreadsheetColumnType.matchedSelect,
  SpreadsheetColumnType.matchedSelectOptions,
  SpreadsheetColumnType.matchedCheckbox,
];

// Keeps the row selection column and the columns of fields a file column
// was matched to
export const filterImportedColumns = (
  columns: Column<ImportedStructuredRow & ImportedStructuredRowMetadata>[],
  importedColumns: SpreadsheetColumns,
) =>
  columns.filter(
    (column) =>
      column.key === 'select-row' ||
      importedColumns.some(
        (importedColumn) =>
          IMPORTED_COLUMN_TYPES.includes(importedColumn.type) &&
          'value' in importedColumn &&
          importedColumn.value === column.key,
      ),
  );
