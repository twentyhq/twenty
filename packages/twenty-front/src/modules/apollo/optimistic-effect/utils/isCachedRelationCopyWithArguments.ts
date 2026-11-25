// Only the server applies a relation's filter, sort and limit, so its copies with arguments are dropped for the next read to refetch them
export const isCachedRelationCopyWithArguments = ({
  storeFieldName,
  relationFieldName,
}: {
  storeFieldName: string;
  relationFieldName: string;
}) => storeFieldName !== relationFieldName;
