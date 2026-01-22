export const getUpdatedFieldsFromRecordInput = (
  recordInput: Record<string, unknown>,
): Record<string, unknown>[] => {
  return Object.entries(recordInput)
    .filter(([fieldName]) => fieldName !== 'id')
    .map(([fieldName, fieldValue]) => ({ [fieldName]: fieldValue }));
};
