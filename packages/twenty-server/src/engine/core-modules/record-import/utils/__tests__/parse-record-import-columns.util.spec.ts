import { FieldMetadataType } from 'twenty-shared/types';
import {
  SpreadsheetColumnType,
  type SpreadsheetImportFieldDescriptor,
} from 'twenty-shared/utils';

import {
  buildRecordImportMappedFields,
  isRecordImportMappingOutdated,
  parseRecordImportColumns,
} from 'src/engine/core-modules/record-import/utils/parse-record-import-columns.util';

const fields: SpreadsheetImportFieldDescriptor[] = [
  {
    key: 'name',
    label: 'Name',
    fieldMetadataItemId: 'name-id',
    fieldMetadataType: FieldMetadataType.TEXT,
    fieldType: { type: 'input' },
    fieldValidationDefinitions: [],
    isNestedField: false,
  },
  {
    key: 'stage',
    label: 'Stage',
    fieldMetadataItemId: 'stage-id',
    fieldMetadataType: FieldMetadataType.SELECT,
    fieldType: {
      type: 'select',
      options: [{ label: 'Lead', value: 'LEAD' }],
    },
    fieldValidationDefinitions: [],
    isNestedField: false,
  },
];

describe('parseRecordImportColumns', () => {
  const headerValues = ['Name', 'Stage', 'Unused'];

  it('keeps a valid mapping and drops unexpected properties', () => {
    const columns = parseRecordImportColumns({
      headerValues,
      fields,
      columns: [
        {
          index: 0,
          type: SpreadsheetColumnType.matched,
          value: 'name',
          header: 'x',
          extra: 1,
        },
        {
          index: 1,
          type: SpreadsheetColumnType.matchedSelectOptions,
          value: 'stage',
          matchedOptions: [
            { entry: 'lead', value: 'LEAD' },
            { entry: 'other' },
          ],
        },
        { index: 2, type: SpreadsheetColumnType.ignored },
      ],
    });

    expect(columns).toEqual([
      {
        index: 0,
        type: SpreadsheetColumnType.matched,
        value: 'name',
        header: 'Name',
      },
      {
        index: 1,
        type: SpreadsheetColumnType.matchedSelect,
        value: 'stage',
        header: 'Stage',
        matchedOptions: [
          { entry: 'lead', value: 'LEAD' },
          { entry: 'other', value: undefined },
        ],
      },
      { index: 2, type: SpreadsheetColumnType.ignored, header: 'Unused' },
    ]);
    expect(buildRecordImportMappedFields(columns!, fields)).toEqual([
      {
        key: 'name',
        fieldMetadataId: 'name-id',
        fieldMetadataType: FieldMetadataType.TEXT,
        optionValues: undefined,
      },
      {
        key: 'stage',
        fieldMetadataId: 'stage-id',
        fieldMetadataType: FieldMetadataType.SELECT,
        optionValues: ['LEAD'],
      },
    ]);
  });

  const ignored = (index: number) => ({
    index,
    type: SpreadsheetColumnType.ignored,
  });

  it.each([
    [
      'an unknown field key',
      [
        { index: 0, type: SpreadsheetColumnType.matched, value: '__proto__' },
        ignored(1),
        ignored(2),
      ],
    ],
    [
      'a field mapped twice',
      [
        { index: 0, type: SpreadsheetColumnType.matched, value: 'name' },
        { index: 1, type: SpreadsheetColumnType.matched, value: 'name' },
        ignored(2),
      ],
    ],
    [
      'an unknown option value',
      [
        ignored(0),
        {
          index: 1,
          type: SpreadsheetColumnType.matchedSelect,
          value: 'stage',
          matchedOptions: [{ entry: 'x', value: 'NOPE' }],
        },
        ignored(2),
      ],
    ],
    ['a column count that does not match the header', [ignored(0)]],
  ])('rejects %s', (_label, columns) => {
    expect(
      parseRecordImportColumns({ headerValues, fields, columns }),
    ).toBeUndefined();
  });
});

describe('isRecordImportMappingOutdated', () => {
  const mappedFields = [
    {
      key: 'stage',
      fieldMetadataId: 'stage-id',
      fieldMetadataType: FieldMetadataType.SELECT,
      optionValues: ['LEAD'],
    },
  ];

  it('accepts an unchanged data model', () => {
    expect(isRecordImportMappingOutdated(mappedFields, fields)).toBe(false);
  });

  it('flags removed fields and removed select options', () => {
    expect(isRecordImportMappingOutdated(mappedFields, [fields[0]])).toBe(true);
    expect(
      isRecordImportMappingOutdated(mappedFields, [
        fields[0],
        { ...fields[1], fieldType: { type: 'select', options: [] } },
      ]),
    ).toBe(true);
  });
});
