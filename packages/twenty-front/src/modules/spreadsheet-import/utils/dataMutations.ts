import { v4 } from 'uuid';

import { type ImportedStructuredRowMetadata } from '@/spreadsheet-import/steps/components/ValidationStep/types';
import {
  type ImportedStructuredRow,
  type SpreadsheetImportFieldValidationDefinition,
  type SpreadsheetImportFields,
  type SpreadsheetImportRowHook,
  type SpreadsheetImportTableHook,
} from '@/spreadsheet-import/types';
import {
  computeSpreadsheetImportRowErrors,
  isDefined,
  type SpreadsheetImportFieldValidationDefinition as SharedSpreadsheetImportFieldValidationDefinition,
} from 'twenty-shared/utils';

const withDefaultErrorMessage = (
  fieldValidationDefinition: SpreadsheetImportFieldValidationDefinition,
): SharedSpreadsheetImportFieldValidationDefinition<string> | undefined => {
  switch (fieldValidationDefinition.rule) {
    case 'required':
      return {
        ...fieldValidationDefinition,
        errorMessage:
          fieldValidationDefinition.errorMessage || 'Field is required',
      };
    case 'unique':
      return {
        ...fieldValidationDefinition,
        errorMessage:
          fieldValidationDefinition.errorMessage || 'Field must be unique',
      };
    case 'regex':
      return {
        ...fieldValidationDefinition,
        errorMessage:
          fieldValidationDefinition.errorMessage ||
          `Field did not match the regex /${fieldValidationDefinition.value}/${fieldValidationDefinition.flags} `,
      };
    case 'function':
      return {
        ...fieldValidationDefinition,
        errorMessage:
          fieldValidationDefinition.errorMessage || 'Field is invalid',
      };
    case 'object':
      return undefined;
  }
};

export const addErrorsAndRunHooks = (
  data: (ImportedStructuredRow & Partial<ImportedStructuredRowMetadata>)[],
  fields: SpreadsheetImportFields,
  rowHook?: SpreadsheetImportRowHook,
  tableHook?: SpreadsheetImportTableHook,
): (ImportedStructuredRow & ImportedStructuredRowMetadata)[] => {
  const { rows, errors } = computeSpreadsheetImportRowErrors<string>({
    rows: data,
    fields: fields.map((field) => ({
      key: field.key,
      fieldValidationDefinitions: field.fieldValidationDefinitions
        ?.map(withDefaultErrorMessage)
        .filter(isDefined),
    })),
    rowHook,
    tableHook,
  });

  return rows.map(
    (
      value: ImportedStructuredRow & Partial<ImportedStructuredRowMetadata>,
      index,
    ) => {
      // This is required only for table. Mutates to prevent needless rerenders
      if (!('__index' in value)) {
        value.__index = v4();
      }
      const newValue = value as ImportedStructuredRow &
        ImportedStructuredRowMetadata;

      if (isDefined(errors[index])) {
        return {
          ...newValue,
          __errors: errors[index],
        } as ImportedStructuredRow & ImportedStructuredRowMetadata;
      }

      if (isDefined(value.__errors)) {
        return { ...newValue, __errors: null } as ImportedStructuredRow &
          ImportedStructuredRowMetadata;
      }

      return newValue;
    },
  );
};
