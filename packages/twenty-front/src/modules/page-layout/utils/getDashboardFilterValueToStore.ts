import { stringifyPageLayoutFilterRelativeDateValue } from '@/page-layout/utils/stringifyPageLayoutFilterRelativeDateValue';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  isNonEmptyArray,
  relativeDateFilterStringifiedSchema,
} from 'twenty-shared/utils';

// A shared URL may carry its author's time zone and week start, which a default must not pin
export const getDashboardFilterValueToStore = (
  value: PageLayoutFilterValue | null,
): PageLayoutFilterValue | null => {
  if (!isDefined(value) || !isNonEmptyArray(value.conditions)) {
    return null;
  }

  return {
    conditions: value.conditions.map((condition) => {
      if (condition.operand !== ViewFilterOperand.IS_RELATIVE) {
        return condition;
      }

      const relativeDateFilter = relativeDateFilterStringifiedSchema.safeParse(
        condition.value,
      );

      return relativeDateFilter.success
        ? {
            ...condition,
            value: stringifyPageLayoutFilterRelativeDateValue(
              relativeDateFilter.data,
            ),
          }
        : condition;
    }),
  };
};
