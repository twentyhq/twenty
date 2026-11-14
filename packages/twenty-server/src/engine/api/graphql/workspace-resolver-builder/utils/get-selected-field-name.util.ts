// Own properties only: a client alias can be any name, including __proto__
export const getSelectedFieldName = ({
  responseKey,
  selection,
}: {
  responseKey: string;
  selection: unknown;
}): string => {
  if (
    typeof selection !== 'object' ||
    selection === null ||
    !Object.prototype.hasOwnProperty.call(selection, '__fieldName')
  ) {
    return responseKey;
  }

  const { __fieldName: fieldName } = selection as { __fieldName: unknown };

  return typeof fieldName === 'string' ? fieldName : responseKey;
};
