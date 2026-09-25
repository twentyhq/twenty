import { saveAs } from 'file-saver';
import {
  buildRecordExportColumns,
  formatRecordExportHeader,
  formatRecordExportRow,
} from 'twenty-shared/utils';

import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

export const csvDownloader = (
  filename: string,
  {
    columns,
    rows,
  }: {
    columns: Pick<
      ColumnDefinition<FieldMetadata>,
      'label' | 'type' | 'metadata'
    >[];
    rows: Record<string, unknown>[];
  },
) => {
  const exportColumns = buildRecordExportColumns(
    columns.map((column) => ({
      name: column.metadata.fieldName,
      label: column.label,
      type: column.type,
      relationType:
        'relationType' in column.metadata
          ? column.metadata.relationType
          : undefined,
    })),
  );
  const blob = new Blob(
    [
      formatRecordExportHeader(exportColumns),
      ...rows.map((record) =>
        formatRecordExportRow({ columns: exportColumns, record }),
      ),
    ],
    { type: 'text/csv' },
  );

  saveAs(blob, filename);
};
