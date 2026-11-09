import { getPageLayoutFilterDateRange } from '@/page-layout/utils/getPageLayoutFilterDateRange';
import { t } from '@lingui/core/macro';
import { type PageLayoutFilterValue } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getPageLayoutFilterDateRangeLabel = ({
  value,
  formatPlainDate,
}: {
  value: PageLayoutFilterValue;
  formatPlainDate: (plainDate: string) => string;
}): string => {
  const { startDate, endDate } = getPageLayoutFilterDateRange(value);
  const formattedStartDate = isDefined(startDate)
    ? formatPlainDate(startDate)
    : '';
  const formattedEndDate = isDefined(endDate) ? formatPlainDate(endDate) : '';

  if (isDefined(startDate) && isDefined(endDate)) {
    return t`${formattedStartDate} – ${formattedEndDate}`;
  }

  if (isDefined(startDate)) {
    return t`From ${formattedStartDate}`;
  }

  return t`Until ${formattedEndDate}`;
};
