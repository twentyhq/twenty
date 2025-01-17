import { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { SettingsObjectTableItem } from '~/pages/settings/data-model/types/SettingsObjectTableItem';

export const GET_SETTINGS_OBJECT_TABLE_METADATA = (
  t: (literals: TemplateStringsArray) => string,
): TableMetadata<SettingsObjectTableItem> => ({
  tableId: 'settingsObject',
  fields: [
    {
      fieldLabel: t`Name`,
      fieldName: 'labelPlural',
      fieldType: 'string',
      align: 'left',
    },
    {
      fieldLabel: t`Type`,
      fieldName: 'objectTypeLabel',
      fieldType: 'string',
      align: 'left',
    },
    {
      fieldLabel: t`Fields`,
      fieldName: 'fieldsCount',
      fieldType: 'number',
      align: 'right',
    },
    {
      fieldLabel: t`Instances`,
      fieldName: 'totalObjectCount',
      fieldType: 'number',
      align: 'right',
    },
  ],
  initialSort: {
    fieldName: 'labelPlural',
    orderBy: 'AscNullsLast',
  },
});
