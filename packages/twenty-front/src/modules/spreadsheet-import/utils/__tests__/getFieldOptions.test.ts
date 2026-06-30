import { type SpreadsheetImportField } from '@/spreadsheet-import/types';
import { getFieldOptions } from '@/spreadsheet-import/utils/getFieldOptions';
import { FieldMetadataType } from 'twenty-shared/types';

describe('getFieldOptions', () => {
  const optionsArray = [
    {
      label: 'one',
      value: 'One',
    },
    {
      label: 'two',
      value: 'Two',
    },
    {
      label: 'three',
      value: 'Three',
    },
  ];
  const fields: SpreadsheetImportField[] = [
    {
      key: 'Options',
      Icon: null,
      label: 'options',
      fieldType: {
        type: 'select',
        options: optionsArray,
      },
      fieldMetadataType: FieldMetadataType.SELECT,
      fieldMetadataItemId: '1',
      isNestedField: false,
    },
    {
      key: 'Name',
      Icon: null,
      label: 'name',
      fieldType: {
        type: 'input',
      },
      fieldMetadataType: FieldMetadataType.TEXT,
      fieldMetadataItemId: '2',
      isNestedField: false,
    },
  ];

  it('should return an empty array if the field does not exist in the fields list', () => {
    const fieldKey = 'NonExistingField';

    const result = getFieldOptions(fields, fieldKey);

    expect(result).toEqual([]);
  });

  it('should return an empty array if the field is not of type select', () => {
    const fieldKey = 'Name';

    const result = getFieldOptions(fields, fieldKey);

    expect(result).toEqual([]);
  });

  it('should return an array of options if the field is of type select', () => {
    const fieldKey = 'Options';

    const result = getFieldOptions(fields, fieldKey);

    expect(result).toEqual(optionsArray);
  });
});
