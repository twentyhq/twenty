export const getFieldInputInstanceId = (
  recordId: string,
  fieldName: string,
) => {
  return `${recordId}-${fieldName}`;
};
