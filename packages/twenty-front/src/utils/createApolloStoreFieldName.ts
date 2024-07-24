export const createApolloStoreFieldName = ({
  fieldName,
  fieldVariables,
}: {
  fieldName: string;
  fieldVariables: Record<string, any>;
}) => {
  return `${fieldName}(${JSON.stringify(fieldVariables)})`;
};
