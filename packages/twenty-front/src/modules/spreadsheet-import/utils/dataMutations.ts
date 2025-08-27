import { isNonEmptyString } from '@sniptt/guards';
import { v4 } from 'uuid';

import {
  type Errors,
  type ImportedStructuredRowMetadata,
} from '@/spreadsheet-import/steps/components/ValidationStep/types';
import {
  type ImportedStructuredRow,
  type SpreadsheetImportFields,
  type SpreadsheetImportInfo,
  type SpreadsheetImportRowHook,
  type SpreadsheetImportTableHook,
} from '@/spreadsheet-import/types';
import { isDefined } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const addErrorsAndRunHooks = (
  data: (ImportedStructuredRow & Partial<ImportedStructuredRowMetadata>)[],
  fields: SpreadsheetImportFields,
  rowHook?: SpreadsheetImportRowHook,
  tableHook?: SpreadsheetImportTableHook,
): (ImportedStructuredRow & ImportedStructuredRowMetadata)[] => {
  const errors: Errors = {};

  const addHookError = (
    rowIndex: number,
    fieldKey: string,
    error: SpreadsheetImportInfo,
  ) => {
    errors[rowIndex] = {
      ...errors[rowIndex],
      [fieldKey]: error,
    };
  };

  if (isDefined(tableHook)) {
    data = tableHook(data, addHookError);
  }

  if (isDefined(rowHook)) {
    data = data.map((value, index) =>
      rowHook(value, (...props) => addHookError(index, ...props), data),
    );
  }

  fields.forEach((field) => {
    field.fieldValidationDefinitions?.forEach((fieldValidationDefinition) => {
      switch (fieldValidationDefinition.rule) {
        case 'unique': {
          const values = data.map((entry) => entry[field.key]);

          const taken = new Set(); // Set of items used at least once
          const duplicates = new Set(); // Set of items used multiple times

          values.forEach((value) => {
            if (
              fieldValidationDefinition.allowEmpty === true &&
              (isUndefinedOrNull(value) || value === '' || !value)
            ) {
              // If allowEmpty is set, we will not validate falsy fields such as undefined or empty string.
              return;
            }

            if (taken.has(value)) {
              duplicates.add(value);
            } else {
              taken.add(value);
            }
          });

          values.forEach((value, index) => {
            if (duplicates.has(value)) {
              errors[index] = {
                ...errors[index],
                [field.key]: {
                  level: fieldValidationDefinition.level || 'error',
                  message:
                    fieldValidationDefinition.errorMessage ||
                    'Field must be unique',
                },
              };
            }
          });
          break;
        }
        case 'required': {
          data.forEach((entry, index) => {
            if (
              entry[field.key] === null ||
              entry[field.key] === undefined ||
              entry[field.key] === ''
            ) {
              errors[index] = {
                ...errors[index],
                [field.key]: {
                  level: fieldValidationDefinition.level || 'error',
                  message:
                    fieldValidationDefinition.errorMessage ||
                    'Field is required',
                },
              };
            }
          });
          break;
        }
        case 'regex': {
          const regex = new RegExp(
            fieldValidationDefinition.value,
            fieldValidationDefinition.flags,
          );
          data.forEach((entry, index) => {
            const value = entry[field.key]?.toString();

            if (isNonEmptyString(value) && !value.match(regex)) {
              errors[index] = {
                ...errors[index],
                [field.key]: {
                  level: fieldValidationDefinition.level || 'error',
                  message:
                    fieldValidationDefinition.errorMessage ||
                    `Field did not match the regex /${fieldValidationDefinition.value}/${fieldValidationDefinition.flags} `,
                },
              };
            }
          });
          break;
        }
        case 'function': {
          data.forEach((entry, index) => {
            const value = entry[field.key]?.toString();

            if (
              isNonEmptyString(value) &&
              !fieldValidationDefinition.isValid(value)
            ) {
              errors[index] = {
                ...errors[index],
                [field.key]: {
                  level: fieldValidationDefinition.level || 'error',
                  message:
                    fieldValidationDefinition.errorMessage ||
                    'Field is invalid',
                },
              };
            }
          });
          break;
        }
      }
    });
  });

  return data.map((value, index) => {
    // This is required only for table. Mutates to prevent needless rerenders
    if (!('__index' in value)) {
      value.__index = v4();
    }
    const newValue = value as ImportedStructuredRow &
      ImportedStructuredRowMetadata;

    if (isDefined(errors[index])) {
      return { ...newValue, __errors: errors[index] } as ImportedStructuredRow &
        ImportedStructuredRowMetadata;
    }

    if (isUndefinedOrNull(errors[index]) && isDefined(value?.__errors)) {
      return { ...newValue, __errors: null } as ImportedStructuredRow &
        ImportedStructuredRowMetadata;
    }
    return newValue;
  });
};
