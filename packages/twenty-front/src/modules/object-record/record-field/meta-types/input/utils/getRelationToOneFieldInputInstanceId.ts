export const getRelationToOneFieldInputInstanceId = ({
  recordId,
  fieldName,
}: {
  recordId: string;
  fieldName: string;
}): string => {
  return `relation-to-one-field-input-${recordId}-${fieldName}`;
};
