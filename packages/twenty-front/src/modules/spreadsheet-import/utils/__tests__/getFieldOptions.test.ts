import { Field } from '@/spreadsheet-import/types';
import { getFieldOptions } from '@/spreadsheet-import/utils/getFieldOptions';
import { FieldMetadataType } from 'twenty-shared';

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
  const fields: Field<'Options' | 'Name'>[] = [
    {
      key: 'Options',
      icon: null,
      label: 'options',
      fieldType: {
        type: 'select',
        options: optionsArray,
      },
      fieldMetadataType: FieldMetadataType.SELECT,
    },
    {
      key: 'Name',
      icon: null,
      label: 'name',
      fieldType: {
        type: 'input',
      },
      fieldMetadataType: FieldMetadataType.TEXT,
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
