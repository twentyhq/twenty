import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { msg } from '@lingui/core/macro';

export type MockedTableType = {
  labelPlural: string;
  fieldsCount: number;
};

export const mockedTableMetadata: TableMetadata<MockedTableType> = {
  tableId: 'SettingsObjectDetail',
  fields: [
    {
      fieldName: 'labelPlural',
      fieldType: 'string',
      align: 'left',
      fieldLabel: msg`Name`,
    },
    {
      fieldName: 'fieldsCount',
      fieldType: 'number',
      align: 'right',
      fieldLabel: msg`Fields Count`,
    },
  ],
};

export const mockedTableData = [
  {
    labelPlural: 'Opportunities',
    fieldsCount: 11,
  },
  {
    labelPlural: 'Contact',
    fieldsCount: 3,
  },
  {
    labelPlural: 'Leads',
    fieldsCount: 4,
  },
  {
    labelPlural: 'Tasks',
    fieldsCount: 5,
  },
];

export const tableDataSortedBylabelInAscendingOrder = [
  { labelPlural: 'Contact', fieldsCount: 3 },
  { labelPlural: 'Leads', fieldsCount: 4 },
  { labelPlural: 'Opportunities', fieldsCount: 11 },
  { labelPlural: 'Tasks', fieldsCount: 5 },
];

export const tableDataSortedBylabelInDescendingOrder = [
  { labelPlural: 'Tasks', fieldsCount: 5 },
  { labelPlural: 'Opportunities', fieldsCount: 11 },
  { labelPlural: 'Leads', fieldsCount: 4 },
  { labelPlural: 'Contact', fieldsCount: 3 },
];

export const tableDataSortedByFieldsCountInAscendingOrder = [
  { labelPlural: 'Contact', fieldsCount: 3 },
  { labelPlural: 'Leads', fieldsCount: 4 },
  { labelPlural: 'Tasks', fieldsCount: 5 },
  { labelPlural: 'Opportunities', fieldsCount: 11 },
];

export const tableDataSortedByFieldsCountInDescendingOrder = [
  { labelPlural: 'Opportunities', fieldsCount: 11 },
  { labelPlural: 'Tasks', fieldsCount: 5 },
  { labelPlural: 'Leads', fieldsCount: 4 },
  { labelPlural: 'Contact', fieldsCount: 3 },
];
