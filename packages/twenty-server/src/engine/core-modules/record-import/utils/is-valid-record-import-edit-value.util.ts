import { type SpreadsheetImportFieldDescriptor } from 'twenty-shared/utils';
import { z } from 'zod';

import { RECORD_IMPORT_MAX_CELL_LENGTH } from 'src/engine/core-modules/record-import/constants/record-import.constants';

const stringArraySchema = z.array(z.string());

export const isValidRecordImportEditValue = (
  value: unknown,
  field: SpreadsheetImportFieldDescriptor,
): boolean => {
  if (value === null || typeof value === 'boolean') {
    return value === null || field.fieldType.type === 'checkbox';
  }

  if (
    typeof value !== 'string' ||
    value.length > RECORD_IMPORT_MAX_CELL_LENGTH
  ) {
    return false;
  }

  if (value === '') {
    return true;
  }

  switch (field.fieldType.type) {
    case 'select':
      return field.fieldType.options.some((option) => option.value === value);
    case 'multiSelect': {
      const optionValues = new Set(
        field.fieldType.options.map((option) => option.value),
      );
      let selectedValues: unknown;

      try {
        selectedValues = JSON.parse(value);
      } catch {
        return false;
      }

      const parsed = stringArraySchema.safeParse(selectedValues);

      return (
        parsed.success &&
        parsed.data.every((selectedValue) => optionValues.has(selectedValue))
      );
    }
    default:
      return true;
  }
};
