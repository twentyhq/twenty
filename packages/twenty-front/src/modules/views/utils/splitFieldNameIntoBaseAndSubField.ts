export const splitFieldNameIntoBaseAndSubField = (
  fieldName: string,
): {
  baseFieldName: string;
  subFieldName?: string;
} => {
  const fieldParts = fieldName.split('.');
  const baseFieldName = fieldParts[0];
  const subFieldName =
    fieldParts.length > 1 ? fieldParts.slice(1).join('.') : undefined;

  return {
    baseFieldName,
    subFieldName,
  };
};
