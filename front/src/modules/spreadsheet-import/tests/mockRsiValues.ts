import { defaultSpreadsheetImportProps } from '@/spreadsheet-import/provider/components/SpreadsheetImport';
import type { Fields, SpreadsheetOptions } from '@/spreadsheet-import/types';

const fields = [
  {
    icon: null,
    label: 'Name',
    key: 'name',
    alternateMatches: ['first name', 'first'],
    fieldType: {
      type: 'input',
    },
    example: 'Stephanie',
    validations: [
      {
        rule: 'required',
        errorMessage: 'Name is required',
      },
    ],
  },
  {
    icon: null,
    label: 'Surname',
    key: 'surname',
    alternateMatches: ['second name', 'last name', 'last'],
    fieldType: {
      type: 'input',
    },
    example: 'McDonald',
    validations: [
      {
        rule: 'unique',
        errorMessage: 'Last name must be unique',
        level: 'info',
      },
    ],
    description: 'Family / Last name',
  },
  {
    icon: null,
    label: 'Age',
    key: 'age',
    alternateMatches: ['years'],
    fieldType: {
      type: 'input',
    },
    example: '23',
    validations: [
      {
        rule: 'regex',
        value: '^\\d+$',
        errorMessage: 'Age must be a number',
        level: 'warning',
      },
    ],
  },
  {
    icon: null,
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
    validations: [
      {
        rule: 'required',
        errorMessage: 'Team is required',
      },
    ],
  },
  {
    icon: null,
    label: 'Is manager',
    key: 'is_manager',
    alternateMatches: ['manages'],
    fieldType: {
      type: 'checkbox',
      booleanMatches: {},
    },
    example: 'true',
  },
] as Fields<string>;

const mockComponentBehaviourForTypes = <T extends string>(
  props: SpreadsheetOptions<T>,
) => props;

export const mockRsiValues = mockComponentBehaviourForTypes({
  ...defaultSpreadsheetImportProps,
  fields: fields,
  onSubmit: async (data) => {
    console.log(data.all.map((value) => value));
  },
  isOpen: true,
  onClose: () => {
    console.log('onClose');
  },
  uploadStepHook: async (data) => {
    await new Promise((resolve) => {
      setTimeout(() => resolve(data), 4000);
    });
    return data;
  },
  selectHeaderStepHook: async (hData, data) => {
    await new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            headerValues: hData,
            data,
          }),
        4000,
      );
    });
    return {
      headerValues: hData,
      data,
    };
  },
  // Runs after column matching and on entry change, more performant
  matchColumnsStepHook: async (data) => {
    await new Promise((resolve) => {
      setTimeout(() => resolve(data), 4000);
    });
    return data;
  },
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
