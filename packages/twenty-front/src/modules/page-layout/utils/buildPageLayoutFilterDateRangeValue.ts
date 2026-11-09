import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { isNonEmptyArray } from 'twenty-shared/utils';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';

// IS_BEFORE excludes its day, so an inclusive end date is stored as the next day.
export const buildPageLayoutFilterDateRangeValue = ({
  startDate,
  endDate,
}: {
  startDate: string | null;
  endDate: string | null;
}): PageLayoutFilterValue | null => {
  const conditions = [
    ...(isNonEmptyString(startDate)
      ? [{ operand: ViewFilterOperand.IS_AFTER, value: startDate }]
      : []),
    ...(isNonEmptyString(endDate)
      ? [
          {
            operand: ViewFilterOperand.IS_BEFORE,
            value: Temporal.PlainDate.from(endDate).add({ days: 1 }).toString(),
          },
        ]
      : []),
  ];

  return isNonEmptyArray(conditions) ? { conditions } : null;
};
