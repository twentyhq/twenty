import {
  FindOptionsOrderValue,
  FindOptionsWhere,
  LessThan,
  MoreThan,
  ObjectLiteral,
} from 'typeorm';

export const applyRangeFilter = (
  where: FindOptionsWhere<ObjectLiteral>,
  order: Record<string, FindOptionsOrderValue> | undefined,
  cursor: Record<string, any>,
): FindOptionsWhere<ObjectLiteral> => {
  if (!order) return where;

  const orderEntries = Object.entries(order);

  orderEntries.forEach(([column, order], index) => {
    if (typeof order !== 'object' || !('direction' in order)) {
      return;
    }
    where[column] =
      order.direction === 'ASC'
        ? MoreThan(cursor[index])
        : LessThan(cursor[index]);
  });

  return where;
};
