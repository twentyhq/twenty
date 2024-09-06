import { Field, Fields } from '@/spreadsheet-import/types';

const titleMap: Record<Field<string>['fieldType']['type'], string> = {
  checkbox: 'Booleano',
  select: 'Opções',
  input: 'Texto',
};

export const generateExampleRow = <T extends string>(fields: Fields<T>) => [
  fields.reduce(
    (acc, field) => {
      acc[field.key as T] = field.example || titleMap[field.fieldType.type];
      return acc;
    },
    {} as Record<T, string>,
  ),
];
