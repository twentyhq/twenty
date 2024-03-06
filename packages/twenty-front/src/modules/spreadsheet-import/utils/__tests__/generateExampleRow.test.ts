import { Field } from '@/spreadsheet-import/types';
import { generateExampleRow } from '@/spreadsheet-import/utils/generateExampleRow';

describe('generateExampleRow', () => {
  const defaultField: Field<'defaultField'> = {
    key: 'defaultField',
    icon: null,
    label: 'label',
    fieldType: {
      type: 'input',
    },
  };

  it('should generate an example row from input field type', () => {
    const fields: Field<'defaultField'>[] = [defaultField];

    const result = generateExampleRow(fields);

    expect(result).toStrictEqual([{ defaultField: 'Text' }]);
  });

  it('should generate an example row from checkbox field type', () => {
    const fields: Field<'defaultField'>[] = [
      {
        ...defaultField,
        fieldType: { type: 'checkbox' },
      },
    ];

    const result = generateExampleRow(fields);

    expect(result).toStrictEqual([{ defaultField: 'Boolean' }]);
  });

  it('should generate an example row from select field type', () => {
    const fields: Field<'defaultField'>[] = [
      {
        ...defaultField,
        fieldType: { type: 'select', options: [] },
      },
    ];

    const result = generateExampleRow(fields);

    expect(result).toStrictEqual([{ defaultField: 'Options' }]);
  });

  it('should generate an example row with provided example values for fields', () => {
    const fields: Field<'defaultField'>[] = [
      {
        ...defaultField,
        example: 'Example',
      },
    ];

    const result = generateExampleRow(fields);

    expect(result).toStrictEqual([{ defaultField: 'Example' }]);
  });
});
