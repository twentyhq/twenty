import { FindOptionsWhere, LessThan, MoreThan, ObjectLiteral } from 'typeorm';

export const applyRangeFilter = (
  where: FindOptionsWhere<ObjectLiteral>,
  cursor: Record<string, any>,
  isForwardPagination = true,
): FindOptionsWhere<ObjectLiteral> => {
  Object.entries(cursor ?? {}).forEach(([key, value]) => {
    if (key === 'id') {
      return;
    }
    where[key] = isForwardPagination ? MoreThan(value) : LessThan(value);
  });

  return where;
};
