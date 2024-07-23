import {
  Field,
  ImportedStructuredRow,
  Info,
  RowHook,
  TableHook,
} from '@/spreadsheet-import/types';
import { addErrorsAndRunHooks } from '@/spreadsheet-import/utils/dataMutations';

describe('addErrorsAndRunHooks', () => {
  type FullData = ImportedStructuredRow<'name' | 'age' | 'country'>;
  const requiredField: Field<'name'> = {
    key: 'name',
    label: 'Name',
    fieldValidationDefinitions: [{ rule: 'required' }],
    icon: null,
    fieldType: { type: 'input' },
  };

  const regexField: Field<'age'> = {
    key: 'age',
    label: 'Age',
    fieldValidationDefinitions: [
      { rule: 'regex', value: '\\d+', errorMessage: 'Regex error' },
    ],
    icon: null,
    fieldType: { type: 'input' },
  };

  const uniqueField: Field<'country'> = {
    key: 'country',
    label: 'Country',
    fieldValidationDefinitions: [{ rule: 'unique' }],
    icon: null,
    fieldType: { type: 'input' },
  };

  const functionValidationFieldTrue: Field<'email'> = {
    key: 'email',
    label: 'Email',
    fieldValidationDefinitions: [
      {
        rule: 'function',
        isValid: () => true,
        errorMessage: 'Field is invalid',
      },
    ],
    icon: null,
    fieldType: { type: 'input' },
  };

  const functionValidationFieldFalse: Field<'email'> = {
    key: 'email',
    label: 'Email',
    fieldValidationDefinitions: [
      {
        rule: 'function',
        isValid: () => false,
        errorMessage: 'Field is invalid',
      },
    ],
    icon: null,
    fieldType: { type: 'input' },
  };

  const validData: ImportedStructuredRow<'name' | 'age'> = {
    name: 'John',
    age: '30',
  };
  const dataWithoutNameAndInvalidAge: ImportedStructuredRow<'name' | 'age'> = {
    name: '',
    age: 'Invalid',
  };
  const dataWithDuplicatedValue: FullData = {
    name: 'Alice',
    age: '40',
    country: 'Brazil',
  };

  const data: ImportedStructuredRow<'name' | 'age'>[] = [
    validData,
    dataWithoutNameAndInvalidAge,
  ];

  const basicError: Info = { message: 'Field is invalid', level: 'error' };
  const nameError: Info = { message: 'Name Error', level: 'error' };
  const ageError: Info = { message: 'Age Error', level: 'error' };
  const regexError: Info = { message: 'Regex error', level: 'error' };
  const requiredError: Info = { message: 'Field is required', level: 'error' };
  const duplicatedError: Info = {
    message: 'Field must be unique',
    level: 'error',
  };

  const rowHook: RowHook<'name' | 'age'> = jest.fn((row, addError) => {
    addError('name', nameError);
    return row;
  });
  const tableHook: TableHook<'name' | 'age'> = jest.fn((table, addError) => {
    addError(0, 'age', ageError);
    return table;
  });

  it('should correctly call rowHook and tableHook and add errors', () => {
    const result = addErrorsAndRunHooks(
      data,
      [requiredField, regexField],
      rowHook,
      tableHook,
    );

    expect(rowHook).toHaveBeenCalled();
    expect(tableHook).toHaveBeenCalled();
    expect(result[0].__errors).toStrictEqual({
      name: nameError,
      age: ageError,
    });
  });

  it('should overwrite hook errors with validation errors', () => {
    const result = addErrorsAndRunHooks(
      data,
      [requiredField, regexField],
      rowHook,
      tableHook,
    );

    expect(rowHook).toHaveBeenCalled();
    expect(tableHook).toHaveBeenCalled();
    expect(result[1].__errors).toStrictEqual({
      name: requiredError,
      age: regexError,
    });
  });

  it('should add errors for required field', () => {
    const result = addErrorsAndRunHooks(data, [requiredField]);

    expect(result[1].__errors).toStrictEqual({
      name: requiredError,
    });
  });

  it('should add errors for regex field', () => {
    const result = addErrorsAndRunHooks(data, [regexField]);

    expect(result[1].__errors).toStrictEqual({
      age: regexError,
    });
  });

  it('should add errors for unique field', () => {
    const result = addErrorsAndRunHooks(
      [
        dataWithDuplicatedValue,
        dataWithDuplicatedValue,
      ] as unknown as FullData[],
      [uniqueField],
    );

    expect(result[0].__errors).toStrictEqual({
      country: duplicatedError,
    });
    expect(result[1].__errors).toStrictEqual({
      country: duplicatedError,
    });
  });

  it('should add errors for unique field with empty values', () => {
    const result = addErrorsAndRunHooks(
      [{ country: '' }, { country: '' }],
      [uniqueField],
    );

    expect(result[0].__errors).toStrictEqual({
      country: duplicatedError,
    });
    expect(result[1].__errors).toStrictEqual({
      country: duplicatedError,
    });
  });

  it('should not add errors for unique field with empty values if allowEmpty is true', () => {
    const result = addErrorsAndRunHooks(
      [{ country: '' }, { country: '' }],
      [
        {
          ...uniqueField,
          fieldValidationDefinitions: [{ rule: 'unique', allowEmpty: true }],
        },
      ],
    );

    expect(result[0].__errors).toBeUndefined();
    expect(result[1].__errors).toBeUndefined();
  });

  it('should add errors for function validation if result is false', () => {
    const result = addErrorsAndRunHooks(
      [{ email: 'email' }],
      [functionValidationFieldFalse],
    );

    expect(result[0].__errors).toStrictEqual({
      email: basicError,
    });
  });

  it('should not add errors for function validation if result is true', () => {
    const result = addErrorsAndRunHooks(
      [{ email: 'email' }],
      [functionValidationFieldTrue],
    );

    expect(result[0].__errors).toBeUndefined();
  });
});
