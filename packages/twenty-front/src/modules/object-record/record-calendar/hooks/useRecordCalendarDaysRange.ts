import { useWeekStartsOnDayIndex } from '@/localization/hooks/useWeekStartsOnDayIndex';
import { getRecordCalendarDaysRange } from '@/object-record/record-calendar/utils/getRecordCalendarDaysRange';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { format } from 'date-fns';
import { type Temporal } from 'temporal-polyfill';
import { turnPlainDateToShiftedDateInSystemTimeZone } from 'twenty-shared/utils';
import { type ViewCalendarLayout } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useRecordCalendarDaysRange = (
  selectedDate: Temporal.PlainDate,
  calendarLayout: ViewCalendarLayout,
) => {
  const dateLocale = useAtomStateValue(dateLocaleState);
  const weekStartsOnDayIndex = useWeekStartsOnDayIndex();
  const range = getRecordCalendarDaysRange({
    selectedDate,
    calendarLayout,
    weekStartsOnDayIndex,
  });

  return {
    ...range,
    weekDayLabels: range.days[0].map((day) =>
      format(turnPlainDateToShiftedDateInSystemTimeZone(day), 'EEE', {
        locale: dateLocale.localeCatalog,
      }),
    ),
  };
};
