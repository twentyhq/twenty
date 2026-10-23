import {
  formatValueForCSV,
  sanitizeValueForCSVExport,
} from 'twenty-shared/utils';

import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';

export const formatRecordExportHeader = (
  columns: Pick<RecordExportColumn, 'label'>[],
): string =>
  '﻿' +
  columns
    .map((column) => formatValueForCSV(sanitizeValueForCSVExport(column.label)))
    .join(',') +
  '\n';
