import { isDate } from '@sniptt/guards';
import {
  formatValueForCSV,
  isDefined,
  sanitizeValueForCSVExport,
} from 'twenty-shared/utils';

export type WorkspaceDataExportColumn = {
  name: string;
  isText: boolean;
};

const formatValue = (value: unknown, column: WorkspaceDataExportColumn) => {
  if (!isDefined(value)) {
    return '';
  }

  if (isDate(value)) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  // Numeric columns arrive as strings from pg; only free text can carry a formula.
  return column.isText ? sanitizeValueForCSVExport(value) : String(value);
};

export const formatWorkspaceDataExportCsvHeader = (
  columns: WorkspaceDataExportColumn[],
): string =>
  '﻿' + columns.map((column) => formatValueForCSV(column.name)).join(',') + '\n';

export const formatWorkspaceDataExportCsvRow = ({
  columns,
  row,
}: {
  columns: WorkspaceDataExportColumn[];
  row: Record<string, unknown>;
}): string =>
  columns
    .map((column) => formatValueForCSV(formatValue(row[column.name], column)))
    .join(',') + '\n';
