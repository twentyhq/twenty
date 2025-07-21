import {
  ImportedStructuredRow,
  SpreadsheetImportField,
  SpreadsheetImportInfo,
  SpreadsheetImportRowHook,
  SpreadsheetImportTableHook,
} from '@/spreadsheet-import/types';
import { addErrorsAndRunHooks } from '@/spreadsheet-import/utils/dataMutations';
import { FieldMetadataType } from 'twenty-shared/types';

describe('addErrorsAndRunHooks', () => {
  type FullData = ImportedStructuredRow<'name' | 'age' | 'country'>;
  const requiredField: SpreadsheetImportField<'name'> = {
    key: 'name',
    label: 'Name',
    fieldValidationDefinitions: [{ rule: 'required' }],
    Icon: null,
    fieldType: { type: 'input' },
    fieldMetadataType: FieldMetadataType.TEXT,
  };

  const regexField: SpreadsheetImportField<'age'> = {
    key: 'age',
    label: 'Age',
    fieldValidationDefinitions: [
      { rule: 'regex', value: '\\d+', errorMessage: 'Regex error' },
    ],
    Icon: null,
    fieldType: { type: 'input' },
    fieldMetadataType: FieldMetadataType.NUMBER,
  };

  const uniqueField: SpreadsheetImportField<'country'> = {
    key: 'country',
    label: 'Country',
    fieldValidationDefinitions: [{ rule: 'unique' }],
    Icon: null,
    fieldType: { type: 'input' },
    fieldMetadataType: FieldMetadataType.SELECT,
  };

  const functionValidationFieldTrue: SpreadsheetImportField<'email'> = {
    key: 'email',
    label: 'Email',
    fieldValidationDefinitions: [
      {
        rule: 'function',
        isValid: () => true,
        errorMessage: 'Field is invalid',
      },
    ],
    Icon: null,
    fieldType: { type: 'input' },
    fieldMetadataType: FieldMetadataType.EMAILS,
  };

  const functionValidationFieldFalse: SpreadsheetImportField<'email'> = {
    key: 'email',
    label: 'Email',
    fieldValidationDefinitions: [
      {
        rule: 'function',
        isValid: () => false,
        errorMessage: 'Field is invalid',
      },
    ],
    Icon: null,
    fieldType: { type: 'input' },
    fieldMetadataType: FieldMetadataType.EMAILS,
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

  const basicError: SpreadsheetImportInfo = {
    message: 'Field is invalid',
    level: 'error',
  };
  const nameError: SpreadsheetImportInfo = {
    message: 'Name Error',
    level: 'error',
  };
  const ageError: SpreadsheetImportInfo = {
    message: 'Age Error',
    level: 'error',
  };
  const regexError: SpreadsheetImportInfo = {
    message: 'Regex error',
    level: 'error',
  };
  const requiredError: SpreadsheetImportInfo = {
    message: 'Field is required',
    level: 'error',
  };
  const duplicatedError: SpreadsheetImportInfo = {
    message: 'Field must be unique',
    level: 'error',
  };

  const rowHook: SpreadsheetImportRowHook<'name' | 'age'> = jest.fn(
    (row, addError) => {
      addError('name', nameError);
      return row;
    },
  );
  const tableHook: SpreadsheetImportTableHook<'name' | 'age'> = jest.fn(
    (table, addError) => {
      addError(0, 'age', ageError);
      return table;
    },
  );

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
