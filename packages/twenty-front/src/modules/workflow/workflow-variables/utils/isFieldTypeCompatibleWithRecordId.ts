import { InputSchemaPropertyType } from '@/workflow/types/InputSchema';

export const isFieldTypeCompatibleWithRecordId = (
  type?: InputSchemaPropertyType,
): boolean => {
  return !type || type === 'string' || type === 'unknown';
};
