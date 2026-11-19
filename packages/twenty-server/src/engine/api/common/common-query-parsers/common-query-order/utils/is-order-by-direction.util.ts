import { isNonEmptyString } from '@sniptt/guards';
import { OrderByDirection } from 'twenty-shared/types';

export const isOrderByDirection = (
  value: unknown,
): value is OrderByDirection => {
  return (
    isNonEmptyString(value) &&
    Object.values(OrderByDirection).includes(value as OrderByDirection)
  );
};
