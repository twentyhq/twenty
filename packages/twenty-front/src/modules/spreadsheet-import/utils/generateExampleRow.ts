import {
  SpreadsheetImportField,
  SpreadsheetImportFields,
} from '@/spreadsheet-import/types';

const titleMap: Record<
  SpreadsheetImportField<string>['fieldType']['type'],
  string
> = {
  checkbox: 'Boolean',
  select: 'Options',
  multiSelect: 'Options',
  input: 'Text',
};

export const generateExampleRow = <T extends string>(
  fields: SpreadsheetImportFields<T>,
) => [
  fields.reduce(
    (acc, field) => {
      acc[field.key as T] = field.example || titleMap[field.fieldType.type];
      return acc;
    },
    {} as Record<T, string>,
  ),
];
