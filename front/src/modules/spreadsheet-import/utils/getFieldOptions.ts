import type { Fields } from '@/spreadsheet-import/types';

export const getFieldOptions = <T extends string>(
  fields: Fields<T>,
  fieldKey: string,
) => {
  const field = fields.find(({ key }) => fieldKey === key)!;
  return field.fieldType.type === 'select' ? field.fieldType.options : [];
};
