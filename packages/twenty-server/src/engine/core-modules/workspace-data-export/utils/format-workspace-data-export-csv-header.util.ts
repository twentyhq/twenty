import { formatValueForCSV } from 'twenty-shared/utils';

import { type WorkspaceDataExportColumn } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-column.type';

export const formatWorkspaceDataExportCsvHeader = (
  columns: WorkspaceDataExportColumn[],
): string =>
  '﻿' + columns.map((column) => formatValueForCSV(column.name)).join(',') + '\n';
