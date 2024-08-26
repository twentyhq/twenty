import {
  FindOptionsOrderValue,
  FindOptionsWhere,
  LessThan,
  MoreThan,
  ObjectLiteral,
} from 'typeorm';

/**
 * Applies a range filter to the provided `where` object based on the `order` and `cursor` parameters.
 *
 *
 * @param where - The `FindOptionsWhere` object to apply the range filter to.
 * @param order - The `Record<string, FindOptionsOrderValue>` object containing the order configuration.
 * @param cursor - The `Record<string, any>` object containing the cursor values.
 * @returns The updated `FindOptionsWhere` object with the range filter applied.
 */
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
