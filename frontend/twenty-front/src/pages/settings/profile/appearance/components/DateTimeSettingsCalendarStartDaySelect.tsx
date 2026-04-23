import { useMemo } from 'react';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { CalendarStartDay } from 'twenty-shared/constants';
import { type SelectOption } from 'twenty-ui/input';

type DateTimeSettingsCalendarStartDaySelectProps = {
  value: CalendarStartDay;
  onChange: (nextValue: CalendarStartDay) => void;
};

export const DateTimeSettingsCalendarStartDaySelect = ({
  value,
  onChange,
}: DateTimeSettingsCalendarStartDaySelectProps) => {
  const systemCalendarStartDay = CalendarStartDay[detectCalendarStartDay()];

  const systemDayContextualText =
    systemCalendarStartDay === CalendarStartDay.SUNDAY
      ? t`Sunday`
      : systemCalendarStartDay === CalendarStartDay.MONDAY
        ? t`Monday`
        : t`Saturday`;

  const options: SelectOption<CalendarStartDay>[] = useMemo(
    () => [
      { label: t`Sunday`, value: CalendarStartDay.SUNDAY },
      { label: t`Monday`, value: CalendarStartDay.MONDAY },
      { label: t`Saturday`, value: CalendarStartDay.SATURDAY },
    ],
    [],
  );

  return (
    <Select
      dropdownId="datetime-settings-calendar-start-day"
      dropdownWidth={218}
      label={t`Calendar start day`}
      fullWidth
      dropdownWidthAuto
      value={value}
      pinnedOption={{
        label: t`System settings`,
        value: CalendarStartDay.SYSTEM,
        contextualText: systemDayContextualText,
      }}
      options={options}
      onChange={onChange}
    />
  );
};
