export const AGGREGATE_FIELD_PATH_SEPARATOR = '.';

export const buildAggregateFieldPath = ({
  relationFieldName,
  targetFieldName,
}: {
  relationFieldName: string;
  targetFieldName: string;
}) => `${relationFieldName}${AGGREGATE_FIELD_PATH_SEPARATOR}${targetFieldName}`;

export const splitAggregateFieldPath = (
  aggregateFieldPath: string,
): { relationFieldName: string | null; fieldName: string } => {
  const separatorIndex = aggregateFieldPath.indexOf(
    AGGREGATE_FIELD_PATH_SEPARATOR,
  );

  if (separatorIndex < 0) {
    return { relationFieldName: null, fieldName: aggregateFieldPath };
  }

  return {
    relationFieldName: aggregateFieldPath.slice(0, separatorIndex),
    fieldName: aggregateFieldPath.slice(separatorIndex + 1),
  };
};
