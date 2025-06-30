export const getFieldInputInstanceId = ({
  recordId,
  fieldName,
}: {
  recordId: string;
  fieldName: string;
}) => {
  return `${recordId}-${fieldName}`;
};
