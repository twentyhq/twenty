import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

import { isOrderByDirection } from '@/object-record/record-show/utils/isOrderByDirection';

const REVERSE_DIRECTION: Record<string, string> = {
  AscNullsFirst: 'DescNullsLast',
  AscNullsLast: 'DescNullsFirst',
  DescNullsFirst: 'AscNullsLast',
  DescNullsLast: 'AscNullsFirst',
};

type OrderByEntry = RecordGqlOperationOrderBy[number];
type OrderByValue = OrderByEntry[string];

export const reverseOrderBy = (
  orderBy: RecordGqlOperationOrderBy,
): RecordGqlOperationOrderBy =>
  orderBy.map((entry) => {
    const reversed: OrderByEntry = {};

    for (const [key, value] of Object.entries(entry)) {
      reversed[key] = reverseValue(value);
    }

    return reversed;
  });

const reverseValue = (value: OrderByValue): OrderByValue => {
  if (isOrderByDirection(value)) {
    return (REVERSE_DIRECTION[value] ?? value) as OrderByValue;
  }
  if (typeof value === 'object' && value !== null) {
    const reversed: OrderByEntry = {};

    for (const [key, subValue] of Object.entries(value as OrderByEntry)) {
      reversed[key] = reverseValue(subValue);
    }

    return reversed;
  }

  return value;
};
