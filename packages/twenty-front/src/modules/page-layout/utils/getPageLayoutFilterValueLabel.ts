import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { getPageLayoutFilterDateRangeLabel } from '@/page-layout/utils/getPageLayoutFilterDateRangeLabel';
import { getPageLayoutFilterValueMode } from '@/page-layout/utils/getPageLayoutFilterValueMode';
import { t } from '@lingui/core/macro';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  isNonEmptyArray,
  relativeDateFilterStringifiedSchema,
} from 'twenty-shared/utils';

export const getPageLayoutFilterValueLabel = ({
  value,
  formatPlainDate,
}: {
  value: PageLayoutFilterValue | null;
  formatPlainDate: (plainDate: string) => string;
}): string => {
  if (!isDefined(value) || !isNonEmptyArray(value.conditions)) {
    return t`No date range`;
  }

  const [firstCondition] = value.conditions;

  switch (getPageLayoutFilterValueMode(value)) {
    case 'RELATIVE': {
      const relativeDateFilter = relativeDateFilterStringifiedSchema.safeParse(
        firstCondition.value,
      );

      if (!relativeDateFilter.success) {
        return t`Other value`;
      }

      const { direction, amount, unit } = relativeDateFilter.data;

      return getRelativeDateDisplayValue({ direction, amount, unit });
    }
    case 'CUSTOM_RANGE':
      return getPageLayoutFilterDateRangeLabel({ value, formatPlainDate });
    default:
      return value.conditions.length === 1 &&
        firstCondition.operand === ViewFilterOperand.IS
        ? formatPlainDate(firstCondition.value)
        : t`Other value`;
  }
};
