import { OrderByDirection } from 'twenty-shared/types';

export const isOrderByDirection = (
  value: unknown,
): value is OrderByDirection => {
  return (
    typeof value === 'string' &&
    Object.values(OrderByDirection).includes(value as OrderByDirection)
  );
};
