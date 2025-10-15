import { type ObjectRecord } from 'twenty-shared/types';

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
