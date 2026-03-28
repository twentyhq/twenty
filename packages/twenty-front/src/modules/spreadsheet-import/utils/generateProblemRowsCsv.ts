import { type ImportRecordWarning } from '@/object-record/hooks/useBatchCreateManyRecords';
import { formatValueForCSV } from '@/spreadsheet-import/utils/formatValueForCSV';
import { sanitizeValueForCSVExport } from '@/spreadsheet-import/utils/sanitizeValueForCSVExport';
import { saveAs } from 'file-saver';

type ProblemRow = {
  status: 'warning' | 'failed';
  issue: string;
  originalRow: Record<string, unknown>;
};

export const generateProblemRowsCsv = ({
  warnings,
  failures,
  originalRows,
  columnHeaders,
  objectNameSingular,
}: {
  warnings: ImportRecordWarning[];
  failures: Array<{ batchStartIndex: number; error: string }>;
  originalRows: Record<string, unknown>[];
  columnHeaders: string[];
  objectNameSingular: string;
}) => {
  const problemRows: ProblemRow[] = [];

  // Add warning rows
  for (const warning of warnings) {
    const originalRow =
      warning.recordId != null
        ? originalRows.find((row) => row['id'] === warning.recordId)
        : undefined;

    problemRows.push({
      status: 'warning',
      issue: `${warning.connectFieldName}: ${warning.reason} (${warning.condition})`,
      originalRow: originalRow ?? {},
    });
  }

  // Add failure rows (batch-level failures)
  for (const failure of failures) {
    problemRows.push({
      status: 'failed',
      issue: failure.error,
      originalRow: {},
    });
  }

  if (problemRows.length === 0) return;

  const headers = ['Import Status', 'Import Issue', ...columnHeaders];

  const csvRows = problemRows.map((row) => {
    const values = [
      formatValueForCSV(sanitizeValueForCSVExport(row.status)),
      formatValueForCSV(sanitizeValueForCSVExport(row.issue)),
      ...columnHeaders.map((header) =>
        formatValueForCSV(sanitizeValueForCSVExport(row.originalRow[header])),
      ),
    ];

    return values.join(',');
  });

  const csvContent = [headers.map(formatValueForCSV).join(','), ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const timestamp = new Date().toISOString().slice(0, 10);

  saveAs(blob, `import-issues-${objectNameSingular}-${timestamp}.csv`);
};
