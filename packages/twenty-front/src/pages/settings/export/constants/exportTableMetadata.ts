import type { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { msg } from '@lingui/core/macro';
import type { ExportObjectItem } from '../types/exportObjectItem';

export const EXPORT_TABLE_METADATA: TableMetadata<ExportObjectItem> = {
  tableId: 'exportObjects',
  fields: [
    {
      fieldLabel: msg`Name`,
      fieldName: 'labelPlural',
      fieldType: 'string',
      align: 'left',
    },
    {
      fieldLabel: msg`Type`,
      fieldName: 'objectTypeLabelText',
      fieldType: 'string',
      align: 'left',
    },
    {
      fieldLabel: msg`Fields`,
      fieldName: 'fieldsCount',
      fieldType: 'number',
      align: 'right',
    },
  ],
  initialSort: {
    fieldName: 'labelPlural',
    orderBy: 'AscNullsLast',
  },
};
