import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

export const useRelativeDatePickerVisibleMonth = ({
  rangeStartDate,
  rangeEndDate,
}: {
  rangeStartDate: Temporal.PlainDate | null;
  rangeEndDate: Temporal.PlainDate | null;
}) => {
  const { calendarSystem } = useDateTimeFormat();

  const rangeKey = `${rangeStartDate?.toString()}-${rangeEndDate?.toString()}`;

  const [monthOffsetForRange, setMonthOffsetForRange] = useState({
    rangeKey,
    monthOffset: 0,
  });

  const monthOffset =
    monthOffsetForRange.rangeKey === rangeKey
      ? monthOffsetForRange.monthOffset
      : 0;

  const visibleMonthDate = (rangeStartDate ?? Temporal.Now.plainDateISO())
    .withCalendar(calendarSystem)
    .with({ day: 1 })
    .add({ months: monthOffset })
    .withCalendar('iso8601');

  return {
    visibleMonthDate,
    showPreviousMonth: () =>
      setMonthOffsetForRange({ rangeKey, monthOffset: monthOffset - 1 }),
    showNextMonth: () =>
      setMonthOffsetForRange({ rangeKey, monthOffset: monthOffset + 1 }),
  };
};
