import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const getValueFromPath = (
  record: Partial<ObjectRecord>,
  path: string,
): string | undefined => {
  const pathParts = path.split('.');

  if (pathParts.length === 1) {
    return record[path];
  }

  const [parentField, childField] = pathParts;

  return record[parentField]?.[childField];
};
