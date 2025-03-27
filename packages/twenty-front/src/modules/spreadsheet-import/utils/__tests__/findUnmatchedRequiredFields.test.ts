import {
  Column,
  ColumnType,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import {
  SpreadsheetImportField,
  SpreadsheetImportFieldValidationDefinition,
} from '@/spreadsheet-import/types';
import { findUnmatchedRequiredFields } from '@/spreadsheet-import/utils/findUnmatchedRequiredFields';
import { FieldMetadataType } from 'twenty-shared/types';

const nameField: SpreadsheetImportField<'Name'> = {
  key: 'Name',
  label: 'Name',
  icon: null,
  fieldType: {
    type: 'input',
  },
  fieldMetadataType: FieldMetadataType.TEXT,
};

const ageField: SpreadsheetImportFieldField<'Age'> = {
  key: 'Age',
  label: 'Age',
  icon: null,
  fieldType: {
    type: 'input',
  },
  fieldMetadataType: FieldMetadataType.NUMBER,
};

const validations: SpreadsheetImportFieldValidationDefinition[] = [
  { rule: 'required' },
];
const nameFieldWithValidations: SpreadsheetImportField<'Name'> = {
  ...nameField,
  fieldValidationDefinitions: validations,
};
const ageFieldWithValidations: SpreadsheetImportField<'Age'> = {
  ...ageField,
  fieldValidationDefinitions: validations,
};

type ColumnValues = 'Name' | 'Age';

const nameColumn: Column<ColumnValues> = {
  type: ColumnType.matched,
  index: 0,
  header: '',
  value: 'Name',
};

const ageColumn: Column<ColumnValues> = {
  type: ColumnType.matched,
  index: 0,
  header: '',
  value: 'Age',
};

const extraColumn: Column<ColumnValues> = {
  type: ColumnType.matched,
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
