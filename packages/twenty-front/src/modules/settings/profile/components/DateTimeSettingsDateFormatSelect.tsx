import { formatInTimeZone } from 'date-fns-tz';

import { Select } from '@/ui/input/components/Select';
import { DateFormat } from '@/workspace-member/constants/DateFormat';

type DateTimeSettingsDateFormatSelectProps = {
  value: DateFormat;
  onChange: (nextValue: DateFormat) => void;
  timeZone: string;
};

export const DateTimeSettingsDateFormatSelect = ({
  onChange,
  timeZone,
  value,
}: DateTimeSettingsDateFormatSelectProps) => (
  <Select
    dropdownId="datetime-settings-date-format"
    label="Date format"
    fullWidth
    value={value}
    options={[
      {
        label: formatInTimeZone(Date.now(), timeZone, DateFormat.MonthFirst),
        value: DateFormat.MonthFirst,
      },
      {
        label: formatInTimeZone(Date.now(), timeZone, DateFormat.DayFirst),
        value: DateFormat.DayFirst,
      },
      {
        label: formatInTimeZone(Date.now(), timeZone, DateFormat.YearFirst),
        value: DateFormat.YearFirst,
      },
    ]}
    onChange={onChange}
  />
);
