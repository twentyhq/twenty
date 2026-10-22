import { saveAs } from 'file-saver';
import {
  buildRecordExportColumns,
  formatRecordExportHeader,
  formatRecordExportRow,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRecordExportFields } from '@/object-record/record-index/export/utils/getRecordExportFields';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

export const csvDownloader = ({
  filename,
  columns,
  rows,
  objectMetadataItems,
}: {
  filename: string;
  columns: Pick<
    ColumnDefinition<FieldMetadata>,
    'label' | 'type' | 'metadata'
  >[];
  rows: Record<string, unknown>[];
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'labelSingular'
  >[];
}) => {
  const exportColumns = buildRecordExportColumns(
    getRecordExportFields({ columns, objectMetadataItems }),
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
