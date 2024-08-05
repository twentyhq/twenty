import { formatInTimeZone } from 'date-fns-tz';

import { DateFormat } from '@/localization/constants/DateFormat';
import { Select } from '@/ui/input/components/Select';

type SettingsAccountsCalendarDateFormatSelectProps = {
  value: DateFormat;
  onChange: (nextValue: DateFormat) => void;
  timeZone: string;
};

export const SettingsAccountsCalendarDateFormatSelect = ({
  onChange,
  timeZone,
  value,
}: SettingsAccountsCalendarDateFormatSelectProps) => (
  <Select
    dropdownId="settings-accounts-calendar-date-format"
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
    ]}
    onChange={onChange}
  />
);
