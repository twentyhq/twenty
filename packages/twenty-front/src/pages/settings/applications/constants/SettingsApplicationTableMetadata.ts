import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { msg } from '@lingui/core/macro';
import { type ApplicationWithoutRelation } from '~/pages/settings/applications/types/applicationWithoutRelation';

export const SETTINGS_APPLICATION_TABLE_METADATA: TableMetadata<ApplicationWithoutRelation> =
  {
    tableId: 'settingsApplication',
    fields: [
      {
        fieldLabel: msg`Name`,
        fieldName: 'name',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Description`,
        fieldName: 'description',
        fieldType: 'string',
        align: 'left',
      },
    ],
    initialSort: {
      fieldName: 'name',
      orderBy: 'AscNullsLast',
    },
  };
