import { SpreadsheetImportFields } from '@/spreadsheet-import/types';

export const getFieldOptions = <T extends string>(
  fields: SpreadsheetImportFields<T>,
  fieldKey: string,
) => {
  const field = fields.find(({ key }) => fieldKey === key);
  if (!field) {
    return [];
  }
  return field.fieldType.type === 'select' ||
    field.fieldType.type === 'multiSelect'
    ? field.fieldType.options
    : [];
};
