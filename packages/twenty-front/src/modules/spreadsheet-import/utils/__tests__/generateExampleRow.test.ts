import { SpreadsheetImportField } from '@/spreadsheet-import/types';
import { generateExampleRow } from '@/spreadsheet-import/utils/generateExampleRow';
import { FieldMetadataType } from 'twenty-shared/types';

describe('generateExampleRow', () => {
  const defaultField: SpreadsheetImportField<'defaultField'> = {
    key: 'defaultField',
    Icon: null,
    label: 'label',
    fieldType: {
      type: 'input',
    },
    fieldMetadataType: FieldMetadataType.TEXT,
  };

  it('should generate an example row from input field type', () => {
    const fields: SpreadsheetImportField<'defaultField'>[] = [defaultField];

    const result = generateExampleRow(fields);

    expect(result).toStrictEqual([{ defaultField: 'Text' }]);
  });

  it('should generate an example row from checkbox field type', () => {
    const fields: SpreadsheetImportField<'defaultField'>[] = [
      {
        ...defaultField,
        fieldType: { type: 'checkbox' },
        fieldMetadataType: FieldMetadataType.BOOLEAN,
      },
    ];

    const result = generateExampleRow(fields);

    expect(result).toStrictEqual([{ defaultField: 'Boolean' }]);
  });

  it('should generate an example row from select field type', () => {
    const fields: SpreadsheetImportField<'defaultField'>[] = [
      {
        ...defaultField,
        fieldType: { type: 'select', options: [] },
        fieldMetadataType: FieldMetadataType.SELECT,
      },
    ];

    const result = generateExampleRow(fields);

    expect(result).toStrictEqual([{ defaultField: 'Options' }]);
  });

  it('should generate an example row with provided example values for fields', () => {
    const fields: SpreadsheetImportField<'defaultField'>[] = [
      {
        ...defaultField,
        example: 'Example',
        fieldMetadataType: FieldMetadataType.TEXT,
      },
    ];

    const result = generateExampleRow(fields);

    expect(result).toStrictEqual([{ defaultField: 'Example' }]);
  });
});
