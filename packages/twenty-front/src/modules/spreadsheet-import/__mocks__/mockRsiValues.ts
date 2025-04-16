import { defaultSpreadsheetImportProps } from '@/spreadsheet-import/provider/components/SpreadsheetImport';
import {
  SpreadsheetImportDialogOptions,
  SpreadsheetImportFields
} from '@/spreadsheet-import/types';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { FieldMetadataType } from 'twenty-shared/types';
import { sleep } from '~/utils/sleep';

const fields = [
  {
    Icon: null,
    label: 'Name',
    key: 'name',
    alternateMatches: ['first name', 'first'],
    fieldType: {
      type: 'input',
    },
    example: 'Stephanie',
    fieldValidationDefinitions: [
      {
        rule: 'required',
        errorMessage: 'Name is required',
      },
    ],
    fieldMetadataType: FieldMetadataType.TEXT,
  },
  {
    Icon: null,
    label: 'Surname',
    key: 'surname',
    alternateMatches: ['second name', 'last name', 'last'],
    fieldType: {
      type: 'input',
    },
    example: 'McDonald',
    fieldValidationDefinitions: [
      {
        rule: 'unique',
        errorMessage: 'Last name must be unique',
        level: 'info',
      },
    ],
    description: 'Family / Last name',
  },
  {
    Icon: null,
    label: 'Age',
    key: 'age',
    alternateMatches: ['years'],
    fieldType: {
      type: 'input',
    },
    example: '23',
    fieldValidationDefinitions: [
      {
        rule: 'regex',
        value: '^\\d+$',
        errorMessage: 'Age must be a number',
        level: 'warning',
      },
    ],
  },
  {
    Icon: null,
    label: 'Team',
    key: 'team',
    alternateMatches: ['department'],
    fieldType: {
      type: 'select',
      options: [
        { label: 'Team One', value: 'one' },
        { label: 'Team Two', value: 'two' },
      ],
    },
    example: 'Team one',
    fieldValidationDefinitions: [
      {
        rule: 'required',
        errorMessage: 'Team is required',
      },
    ],
  },
  {
    Icon: null,
    label: 'Is manager',
    key: 'is_manager',
    alternateMatches: ['manages'],
    fieldType: {
      type: 'checkbox',
      booleanMatches: {},
    },
    example: 'true',
  },
] as SpreadsheetImportFields<string>;

export const importedColums: SpreadsheetColumns<string> = [
  {
    header: 'Name',
    index: 0,
    type: 2,
    value: 'name',
  },
  {
    header: 'Surname',
    index: 1,
    type: 2,
    value: 'surname',
  },
  {
    header: 'Age',
    index: 2,
    type: 2,
    value: 'age',
  },
  {
    header: 'Team',
    index: 3,
    type: 2,
    value: 'team',
  },
];

const mockComponentBehaviourForTypes = <T extends string>(
  props: SpreadsheetImportDialogOptions<T>,
) => props;

export const mockRsiValues = mockComponentBehaviourForTypes({
  ...defaultSpreadsheetImportProps,
  fields: fields,
  onSubmit: async () => {
    return;
  },
  isOpen: true,
  onClose: () => {
    return;
  },
  uploadStepHook: async (data) => {
    await sleep(4000, (resolve) => resolve(data));
    return data;
  },
  selectHeaderStepHook: async (hData, data) => {
    await sleep(4000, (resolve) =>
      resolve({
        headerValues: hData,
        data,
      }),
    );
    return {
      headerRow: hData,
      importedRows: data,
    };
  },
  // Runs after column matching and on entry change, more performant
  matchColumnsStepHook: async (data) => {
    await sleep(4000, (resolve) => resolve(data));
    return data;
  },
  availableFieldMetadataItems: []
});

export const editableTableInitialData = [
  {
    name: 'Hello',
    surname: 'Hello',
    age: '123123',
    team: 'one',
    is_manager: true,
  },
  {
    name: 'Hello',
    surname: 'Hello',
    age: '12312zsas3',
    team: 'two',
    is_manager: true,
  },
  {
    name: 'Whooaasdasdawdawdawdiouasdiuasdisdhasd',
    surname: 'Hello',
    age: '123123',
    team: undefined,
    is_manager: false,
  },
  {
    name: 'Goodbye',
    surname: 'Goodbye',
    age: '111',
    team: 'two',
    is_manager: true,
  },
];

export const headerSelectionTableFields = [
  ['text', 'num', 'select', 'bool'],
  ['Hello', '123', 'one', 'true'],
  ['Hello', '123', 'one', 'true'],
  ['Hello', '123', 'one', 'true'],
];
