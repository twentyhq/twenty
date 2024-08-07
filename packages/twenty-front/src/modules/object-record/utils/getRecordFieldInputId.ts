export const getRecordFieldInputId = (
  recordId: string,
  fieldName?: string,
): string => {
  return `${recordId}-${fieldName}`;
};
