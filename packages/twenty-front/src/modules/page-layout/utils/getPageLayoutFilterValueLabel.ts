import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { getPageLayoutFilterDateRange } from '@/side-panel/pages/page-layout/utils/getPageLayoutFilterDateRange';
import { t } from '@lingui/core/macro';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  resolveRelativeDateFilterStringified,
} from 'twenty-shared/utils';

export const getPageLayoutFilterValueLabel = ({
  value,
  formatPlainDate,
}: {
  value: PageLayoutFilterValue | null;
  formatPlainDate: (plainDate: string) => string;
}): string => {
  const relativeDateFilter = resolveRelativeDateFilterStringified(
    value?.conditions.find(
      ({ operand }) => operand === ViewFilterOperand.IS_RELATIVE,
    )?.value,
  );

  if (isDefined(relativeDateFilter)) {
    return getRelativeDateDisplayValue(relativeDateFilter);
  }

  const exactDate = value?.conditions.find(
    ({ operand }) => operand === ViewFilterOperand.IS,
  )?.value;

  if (isDefined(exactDate)) {
    return formatPlainDate(exactDate);
  }

  const { startDate, endDate } = getPageLayoutFilterDateRange(value);
  const [formattedStartDate, formattedEndDate] = [startDate, endDate].map(
    (plainDate) => (isDefined(plainDate) ? formatPlainDate(plainDate) : null),
  );

  if (isDefined(formattedStartDate) && isDefined(formattedEndDate)) {
    return `${formattedStartDate} – ${formattedEndDate}`;
  }

  if (isDefined(formattedStartDate)) {
    return t`From ${formattedStartDate}`;
  }

  if (isDefined(formattedEndDate)) {
    return t`Until ${formattedEndDate}`;
  }

  return t`All time`;
};
