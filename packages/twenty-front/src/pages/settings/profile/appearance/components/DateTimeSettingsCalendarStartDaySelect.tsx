import { useMemo } from 'react';

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
  const options: SelectOption<number>[] = useMemo(() => {
    const allowedDaysWeek: DayNameWithIndex[] = [
      { day: t`Sunday`, index: 0 },
      { day: t`Monday`, index: 1 },
      { day: t`Saturday`, index: 6 },
    ];

    return allowedDaysWeek.map(({ day, index }) => ({
      label: day,
      value: index,
    }));
  }, []);

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
