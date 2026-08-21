/**
 * twentyhq / twenty chunked CSV / JSON streaming exporter
 */
export interface ExportProgress {
  exportedRows: number;
  totalRows: number;
  percent: number;
}

export function formatCsvRow(fields: Array<string | number | boolean | null | undefined>): string {
  return fields.map(val => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }).join(',');
}
