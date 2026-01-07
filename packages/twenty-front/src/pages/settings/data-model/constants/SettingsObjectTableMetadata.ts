import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { msg } from '@lingui/core/macro';
import { type SettingsObjectTableItem } from '~/pages/settings/data-model/types/SettingsObjectTableItem';

export const GET_SETTINGS_OBJECT_TABLE_METADATA: TableMetadata<SettingsObjectTableItem> =
  {
    tableId: 'settingsObject',
    fields: [
      {
        fieldLabel: msg`Name`,
        fieldName: 'labelPlural',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`App`,
        fieldName: 'objectTypeLabel',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Fields`,
        fieldName: 'fieldsCount',
        fieldType: 'number',
        align: 'right',
      },
      {
        fieldLabel: msg`Instances`,
        fieldName: 'totalObjectCount',
        fieldType: 'number',
        align: 'right',
      },
    ],
    initialSort: {
      fieldName: 'labelPlural',
      orderBy: 'AscNullsLast',
    },
  };
