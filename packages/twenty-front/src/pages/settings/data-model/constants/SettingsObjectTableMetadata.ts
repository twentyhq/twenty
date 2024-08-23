import { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { SettingsObjectTableItem } from '~/pages/settings/data-model/types/SettingsObjectTableItem';

export const SETTINGS_OBJECT_TABLE_METADATA: TableMetadata<SettingsObjectTableItem> =
  {
    tableId: 'settingsObject',
    fields: [
      {
        fieldLabel: 'Name',
        fieldName: 'labelPlural',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: 'Type',
        fieldName: 'objectTypeLabel',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: 'Fields',
        fieldName: 'fieldsCount',
        fieldType: 'number',
        align: 'right',
      },
      {
        fieldLabel: 'Instances',
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
