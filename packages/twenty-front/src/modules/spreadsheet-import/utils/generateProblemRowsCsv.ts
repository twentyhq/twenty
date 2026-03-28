import { type ImportRecordWarning } from '@/object-record/hooks/useBatchCreateManyRecords';
import { formatValueForCSV } from '@/spreadsheet-import/utils/formatValueForCSV';
import { sanitizeValueForCSVExport } from '@/spreadsheet-import/utils/sanitizeValueForCSVExport';
import { saveAs } from 'file-saver';

type ColumnMapping = {
  key: string;
  label: string;
};

type ProblemRow = {
  status: 'warning' | 'failed';
  issue: string;
  originalRow: Record<string, unknown>;
};

export const generateProblemRowsCsv = ({
  warnings,
  failures,
  originalRows,
  columns,
  objectNameSingular,
}: {
  warnings: ImportRecordWarning[];
  failures: Array<{ batchStartIndex: number; error: string }>;
  originalRows: Record<string, unknown>[];
  columns: ColumnMapping[];
  objectNameSingular: string;
}) => {
  const problemRows: ProblemRow[] = [];

  // Deduplicate warnings by recordId to avoid multiple rows for the same record
  const seenRecordIds = new Set<string>();

  for (const warning of warnings) {
    const originalRow =
      warning.recordId != null
        ? originalRows.find((row) => row['id'] === warning.recordId)
        : undefined;

    // Skip duplicate warnings for the same record
    if (warning.recordId != null) {
      if (seenRecordIds.has(warning.recordId)) continue;
      seenRecordIds.add(warning.recordId);
    }

    problemRows.push({
      status: 'warning',
      issue: `${warning.connectFieldName}: ${warning.reason} (${warning.condition})`,
      originalRow: originalRow ?? {},
    });
  }

  for (const failure of failures) {
    problemRows.push({
      status: 'failed',
      issue: failure.error,
      originalRow: {},
    });
  }

  if (problemRows.length === 0) return;

  // Use human-readable labels as CSV headers, extract values by internal key
  const headers = [
    'Import Status',
    'Import Issue',
    ...columns.map((col) => col.label),
  ];

  const csvRows = problemRows.map((row) => {
    const values = [
      formatValueForCSV(sanitizeValueForCSVExport(row.status)),
      formatValueForCSV(sanitizeValueForCSVExport(row.issue)),
      ...columns.map((col) =>
        formatValueForCSV(sanitizeValueForCSVExport(row.originalRow[col.key])),
      ),
    ];

    return values.join(',');
  });

  const csvContent = [headers.map(formatValueForCSV).join(','), ...csvRows].join(
    '\n',
  );
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const timestamp = new Date().toISOString().slice(0, 10);

  saveAs(blob, `import-issues-${objectNameSingular}-${timestamp}.csv`);
};
