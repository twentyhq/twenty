import { isDate } from '@sniptt/guards';
import {
  formatValueForCSV,
  isDefined,
  sanitizeValueForCSVExport,
} from 'twenty-shared/utils';

import { type WorkspaceDataExportColumn } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-column.type';

const formatValue = ({
  value,
  column,
}: {
  value: unknown;
  column: Pick<WorkspaceDataExportColumn, 'isText'>;
}) => {
  if (!isDefined(value)) {
    return '';
  }

  if (isDate(value)) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return column.isText ? sanitizeValueForCSVExport(value) : String(value);
};

export const formatWorkspaceDataExportCsvRow = ({
  columns,
  row,
}: {
  columns: WorkspaceDataExportColumn[];
  row: Record<string, unknown>;
}): string =>
  columns
    .map((column) =>
      formatValueForCSV(formatValue({ value: row[column.name], column })),
    )
    .join(',') + '\n';
