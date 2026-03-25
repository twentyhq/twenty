import {
  type SpreadsheetImportField,
  type SpreadsheetImportFieldValidationDefinition,
} from '@/spreadsheet-import/types';
import { type SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { findUnmatchedRequiredFields } from '@/spreadsheet-import/utils/findUnmatchedRequiredFields';
import { FieldMetadataType } from 'twenty-shared/types';

const nameField: SpreadsheetImportField = {
  key: 'Name',
  label: 'Name',
  Icon: null,
  fieldType: {
    type: 'input',
  },
  fieldMetadataType: FieldMetadataType.TEXT,
  fieldMetadataItemId: '1',
  isNestedField: false,
};

const ageField: SpreadsheetImportField = {
  key: 'Age',
  label: 'Age',
  Icon: null,
  fieldType: {
    type: 'input',
  },
  fieldMetadataType: FieldMetadataType.NUMBER,
  fieldMetadataItemId: '2',
  isNestedField: false,
};

const validations: SpreadsheetImportFieldValidationDefinition[] = [
  { rule: 'required' },
];
const nameFieldWithValidations: SpreadsheetImportField = {
  ...nameField,
  fieldValidationDefinitions: validations,
};
const ageFieldWithValidations: SpreadsheetImportField = {
  ...ageField,
  fieldValidationDefinitions: validations,
};

const nameColumn: SpreadsheetColumn = {
  type: SpreadsheetColumnType.matched,
  index: 0,
  header: '',
  value: 'Name',
};

const ageColumn: SpreadsheetColumn = {
  type: SpreadsheetColumnType.matched,
  index: 0,
  header: '',
  value: 'Age',
};

const extraColumn: SpreadsheetColumn = {
  type: SpreadsheetColumnType.matched,
  index: 0,
  header: '',
  value: 'Age',
};

describe('findUnmatchedRequiredFields', () => {
  it('should return an empty array if all required fields are matched', () => {
    const fields = [nameFieldWithValidations, ageFieldWithValidations];
    const columns = [nameColumn, ageColumn];

    const result = findUnmatchedRequiredFields(fields, columns);

    expect(result).toStrictEqual([]);
  });

  it('should return an array of labels for required fields that are not matched', () => {
    const fields = [nameFieldWithValidations, ageFieldWithValidations];
    const columns = [nameColumn];

    const result = findUnmatchedRequiredFields(fields, columns);

    expect(result).toStrictEqual(['Age']);
  });

  it('should return an empty array if there are no required fields', () => {
    const fields = [nameField, ageField];
    const columns = [nameColumn];

    const result = findUnmatchedRequiredFields(fields, columns);

    expect(result).toStrictEqual([]);
  });

  it('should return an empty array if all required fields are matched even if there are extra columns', () => {
    const fields = [nameFieldWithValidations, ageFieldWithValidations];

    const columns = [nameColumn, ageColumn, extraColumn];

    const result = findUnmatchedRequiredFields(fields, columns);

    expect(result).toStrictEqual([]);
  });
});
