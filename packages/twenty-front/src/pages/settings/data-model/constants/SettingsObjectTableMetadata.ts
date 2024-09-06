import { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { SettingsObjectTableItem } from '~/pages/settings/data-model/types/SettingsObjectTableItem';

export const SETTINGS_OBJECT_TABLE_METADATA: TableMetadata<SettingsObjectTableItem> =
  {
    tableId: 'settingsObject',
    fields: [
      {
        fieldLabel: 'Nome',
        fieldName: 'labelPlural',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: 'Tipo',
        fieldName: 'objectTypeLabel',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: 'Campos',
        fieldName: 'fieldsCount',
        fieldType: 'number',
        align: 'right',
      },
      {
        fieldLabel: 'Instâncias',
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
