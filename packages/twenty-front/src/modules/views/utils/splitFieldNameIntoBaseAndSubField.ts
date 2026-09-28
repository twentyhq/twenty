export const splitFieldNameIntoBaseAndSubField = (
  fieldName: string,
): {
  baseFieldName: string;
  subFieldName?: string;
} => {
  const separatorIndex = fieldName.indexOf('.');

  if (separatorIndex === -1) {
    return { baseFieldName: fieldName, subFieldName: undefined };
  }

  return {
    baseFieldName: fieldName.slice(0, separatorIndex),
    subFieldName: fieldName.slice(separatorIndex + 1),
  };
};
