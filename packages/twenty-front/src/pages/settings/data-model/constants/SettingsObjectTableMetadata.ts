import { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { SettingsObjectTableItem } from '~/pages/settings/data-model/types/SettingsObjectTableItem';

type GET_SETTINGS_OBJECT_TABLE_METADATAProps = {
  (descriptor: { id: string }): string;
  (literals: TemplateStringsArray, ...placeholders: any[]): string;
};

export const GET_SETTINGS_OBJECT_TABLE_METADATA = (
  t: GET_SETTINGS_OBJECT_TABLE_METADATAProps,
): TableMetadata<SettingsObjectTableItem> => ({
  tableId: 'settingsObject',
  fields: [
    {
      fieldLabel: t({ id: 'Name' }),
      fieldName: 'labelPlural',
      fieldType: 'string',
      align: 'left',
    },
    {
      fieldLabel: t({ id: 'Type' }),
      fieldName: 'objectTypeLabel',
      fieldType: 'string',
      align: 'left',
    },
    {
      fieldLabel: t({ id: 'Fields' }),
      fieldName: 'fieldsCount',
      fieldType: 'number',
      align: 'right',
    },
    {
      fieldLabel: t({ id: 'Instances' }),
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
