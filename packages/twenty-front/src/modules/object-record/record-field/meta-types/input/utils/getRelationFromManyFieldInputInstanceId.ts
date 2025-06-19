export const getRelationFromManyFieldInputInstanceId = ({
  recordId,
  fieldName,
}: {
  recordId: string;
  fieldName: string;
}): string => {
  return `relation-from-many-field-input-${recordId}-${fieldName}`;
};
