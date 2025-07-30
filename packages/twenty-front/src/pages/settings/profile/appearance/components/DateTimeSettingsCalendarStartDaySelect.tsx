import { useMemo } from 'react';

import { CalendarStartDay } from '@/localization/constants/CalendarStartDay';
import { detectCalendarStartDay } from '@/localization/utils/detectCalendarStartDay';
import { Select } from '@/ui/input/components/Select';
import { DayNameWithIndex } from '@/ui/input/components/internal/date/types/DayNameWithIndex';
import { t } from '@lingui/core/macro';
import { SelectOption } from 'twenty-ui/input';

type DateTimeSettingsCalendarStartDaySelectProps = {
  value: number;
  onChange: (nextValue: number) => void;
};

export const DateTimeSettingsCalendarStartDaySelect = ({
  value,
  onChange,
}: DateTimeSettingsCalendarStartDaySelectProps) => {
  const systemCalendarStartDay = CalendarStartDay[detectCalendarStartDay()];

  const options: SelectOption<number>[] = useMemo(() => {
    const systemDayLabel =
      systemCalendarStartDay === CalendarStartDay.SUNDAY
        ? t`System settings - Sunday`
        : systemCalendarStartDay === CalendarStartDay.MONDAY
          ? t`System settings - Monday`
          : t`System settings - Saturday`;

    const allowedDaysWeek: DayNameWithIndex[] = [
      {
        day: systemDayLabel,
        index: CalendarStartDay.SYSTEM,
      },
      { day: t`Sunday`, index: CalendarStartDay.SUNDAY },
      { day: t`Monday`, index: CalendarStartDay.MONDAY },
      { day: t`Saturday`, index: CalendarStartDay.SATURDAY },
    ];

    return allowedDaysWeek.map(({ day, index }) => ({
      label: day,
      value: index,
    }));
  }, [systemCalendarStartDay]);

  return (
    <Select
      dropdownId="datetime-settings-calendar-start-day"
      dropdownWidth={218}
      label={t`Calendar start day`}
      fullWidth
      dropdownWidthAuto
      value={value}
      options={options}
      onChange={onChange}
    />
  );
};
