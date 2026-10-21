import { t } from '@lingui/core/macro';
import { saveAs } from 'file-saver';
import {
  buildRecordExportColumns,
  formatRecordExportHeader,
  formatRecordExportRow,
} from 'twenty-shared/utils';

import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES } from '@/settings/data-model/constants/CompositeFieldSubFieldLabelMessages';

export const csvDownloader = ({
  filename,
  columns,
  rows,
}: {
  filename: string;
  columns: Pick<
    ColumnDefinition<FieldMetadata>,
    'label' | 'type' | 'metadata'
  >[];
  rows: Record<string, unknown>[];
}) => {
  const exportColumns = buildRecordExportColumns(
    columns.map((column) => ({
      name: column.metadata.fieldName,
      label: column.label,
      type: column.type,
      subFieldLabels: isCompositeFieldType(column.type)
        ? Object.fromEntries(
            Object.entries(
              COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES[column.type],
            ).map(([name, message]) => [name, t(message)]),
          )
        : undefined,
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
