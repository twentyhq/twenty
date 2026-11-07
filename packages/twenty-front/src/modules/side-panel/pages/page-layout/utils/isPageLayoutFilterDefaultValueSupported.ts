import { PAGE_LAYOUT_FILTER_RELATIVE_AMOUNT_MAX } from '@/side-panel/pages/page-layout/constants/PageLayoutFilterRelativeAmountMax';
import { RELATIVE_DATE_UNITS } from '@/ui/input/components/internal/date/constants/RelativeDateUnits';
import {
  isDateWithoutTime,
  isDefined,
  resolveRelativeDateFilterStringified,
} from 'twenty-shared/utils';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';

export const isPageLayoutFilterDefaultValueSupported = (
  pageLayoutFilterValue: Pick<PageLayoutFilterValue, 'conditions'> | null,
): boolean =>
  (pageLayoutFilterValue?.conditions ?? []).every(({ operand, value }) => {
    if (operand !== ViewFilterOperand.IS_RELATIVE) {
      return isDateWithoutTime(value) && !value.startsWith('0000');
    }

    const relativeDateFilter = resolveRelativeDateFilterStringified(value);

    return (
      isDefined(relativeDateFilter) &&
      RELATIVE_DATE_UNITS.includes(relativeDateFilter.unit) &&
      (relativeDateFilter.amount ?? 0) <= PAGE_LAYOUT_FILTER_RELATIVE_AMOUNT_MAX
    );
  });
