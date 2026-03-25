import { type SpreadsheetImportFields } from '@/spreadsheet-import/types';

export const getFieldOptions = (
  fields: SpreadsheetImportFields,
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
