import { type ShahryarReportRow } from '@/shahryar/utils/shahryarReportUtils';

type ShahryarReportExportFormat = 'csv' | 'print';

const buildCsvCell = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`;

export const buildShahryarReportCsv = (rows: ShahryarReportRow[]) => {
  const header = [
    'Period',
    'Visits',
    'Sales cartons',
    'Requests',
    'Primary insight',
    'Secondary insight',
    'Notes',
  ];
  const body = rows.map((row) =>
    [
      row.period,
      row.visits,
      row.salesCartons,
      row.requests,
      row.primaryInsight,
      row.secondaryInsight,
      row.notes,
    ].map(buildCsvCell),
  );

  return [header.map(buildCsvCell), ...body]
    .map((row) => row.join(','))
    .join('\n');
};

const downloadTextFile = ({
  content,
  fileName,
  type,
}: {
  content: string;
  fileName: string;
  type: string;
}) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

export const exportShahryarReport = ({
  format,
  rows,
}: {
  format: ShahryarReportExportFormat;
  rows: ShahryarReportRow[];
}) => {
  if (format === 'csv') {
    downloadTextFile({
      content: buildShahryarReportCsv(rows),
      fileName: 'shahryar-report.csv',
      type: 'text/csv;charset=utf-8',
    });

    return;
  }

  window.print();
};
