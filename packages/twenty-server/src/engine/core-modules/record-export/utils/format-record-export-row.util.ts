import { isDate } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  formatValueForCSV,
  isDefined,
  isPlainObject,
  sanitizeValueForCSVExport,
} from 'twenty-shared/utils';

import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';

export const formatRecordExportRow = ({
  columns,
  record,
}: {
  columns: RecordExportColumn[];
  record: Record<string, unknown>;
}): string =>
  columns
    .map((column) => {
      let value = record[column.fieldName];

      if (isDefined(column.subFieldName)) {
        value = isPlainObject(value) ? value[column.subFieldName] : undefined;
      }

      if (
        column.type === FieldMetadataType.CURRENCY &&
        column.subFieldName === 'amountMicros' &&
        isDefined(value)
      ) {
        value = Number(value) / 1_000_000;
      }

      if (isDate(value)) {
        value =
          column.type === FieldMetadataType.DATE
            ? value.toISOString().slice(0, 10)
            : value.toISOString();
      }

      return formatValueForCSV(
        typeof value === 'string' ? sanitizeValueForCSVExport(value) : value,
      );
    })
    .join(',') + '\n';
