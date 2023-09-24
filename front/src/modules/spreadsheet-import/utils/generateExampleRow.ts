import { type Field, type Fields } from '@/spreadsheet-import/types';

const titleMap: Record<Field<string>['fieldType']['type'], string> = {
  checkbox: 'Boolean',
  select: 'Options',
  input: 'Text',
};

export const generateExampleRow = <T extends string>(fields: Fields<T>) => [
  fields.reduce((acc, field) => {
    acc[field.key as T] = field.example || titleMap[field.fieldType.type];
    return acc;
  }, {} as Record<T, string>),
];
