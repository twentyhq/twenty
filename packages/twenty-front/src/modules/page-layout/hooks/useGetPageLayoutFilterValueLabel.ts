import { useGetDateFilterDisplayValue } from '@/object-record/object-filter-dropdown/hooks/useGetDateFilterDisplayValue';
import { getPageLayoutFilterValueLabel } from '@/page-layout/utils/getPageLayoutFilterValueLabel';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { Temporal } from 'temporal-polyfill';
import { type PageLayoutFilterValue } from 'twenty-shared/types';

export const useGetPageLayoutFilterValueLabel = () => {
  const { userTimezone } = useUserTimezone();
  const { getDateFilterDisplayValue } = useGetDateFilterDisplayValue();

  const formatPlainDate = (plainDate: string) =>
    getDateFilterDisplayValue(
      Temporal.PlainDate.from(plainDate).toZonedDateTime(userTimezone),
    ).displayValue;

  return {
    getValueLabel: (value: PageLayoutFilterValue | null) =>
      getPageLayoutFilterValueLabel({ value, formatPlainDate }),
  };
};
