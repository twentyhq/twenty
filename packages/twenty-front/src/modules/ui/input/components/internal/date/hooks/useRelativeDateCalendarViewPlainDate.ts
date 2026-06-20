import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

type UseRelativeDateCalendarViewPlainDateArgs = {
  isRelative?: boolean;
  relativeDateRangeKey?: string;
  relativeRangeStartPlainDate: Temporal.PlainDate | null;
};

export const useRelativeDateCalendarViewPlainDate = ({
  isRelative,
  relativeDateRangeKey,
  relativeRangeStartPlainDate,
}: UseRelativeDateCalendarViewPlainDateArgs) => {
  const fallbackPlainDate = Temporal.Now.plainDateISO();

  const [calendarViewPlainDate, setCalendarViewPlainDate] = useState(
    () => relativeRangeStartPlainDate ?? fallbackPlainDate,
  );

  const [syncedRelativeDateRangeKey, setSyncedRelativeDateRangeKey] = useState(
    relativeDateRangeKey ?? '',
  );

  if (
    isRelative &&
    isDefined(relativeDateRangeKey) &&
    relativeDateRangeKey !== syncedRelativeDateRangeKey
  ) {
    setSyncedRelativeDateRangeKey(relativeDateRangeKey);

    if (isDefined(relativeRangeStartPlainDate)) {
      setCalendarViewPlainDate(relativeRangeStartPlainDate);
    }
  }

  const handleAddMonth = () => {
    setCalendarViewPlainDate((previousPlainDate) =>
      previousPlainDate.add({ months: 1 }),
    );
  };

  const handleSubtractMonth = () => {
    setCalendarViewPlainDate((previousPlainDate) =>
      previousPlainDate.subtract({ months: 1 }),
    );
  };

  return {
    calendarViewPlainDate,
    handleAddMonth,
    handleSubtractMonth,
  };
};
