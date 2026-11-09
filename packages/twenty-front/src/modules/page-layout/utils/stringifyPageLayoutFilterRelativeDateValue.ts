import {
  type RelativeDateFilter,
  stringifyRelativeDateFilter,
} from 'twenty-shared/utils';

// Stored without a timezone or week start: the viewer's own apply when the filter resolves
export const stringifyPageLayoutFilterRelativeDateValue = ({
  direction,
  amount,
  unit,
}: RelativeDateFilter): string =>
  stringifyRelativeDateFilter({ direction, amount, unit });
