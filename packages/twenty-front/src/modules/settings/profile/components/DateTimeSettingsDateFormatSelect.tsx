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
        label: formatInTimeZone(Date.now(), timeZone, DateFormat.MONTH_FIRST),
        value: DateFormat.MONTH_FIRST,
      },
      {
        label: formatInTimeZone(Date.now(), timeZone, DateFormat.DAY_FIRST),
        value: DateFormat.DAY_FIRST,
      },
      {
        label: formatInTimeZone(Date.now(), timeZone, DateFormat.YEAR_FIRST),
        value: DateFormat.YEAR_FIRST,
      },
    ]}
    onChange={onChange}
  />
);
