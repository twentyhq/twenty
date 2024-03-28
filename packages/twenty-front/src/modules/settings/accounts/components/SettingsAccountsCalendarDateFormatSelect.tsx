import { formatInTimeZone } from 'date-fns-tz';

import { DateFormat } from '@/settings/accounts/constants/DateFormat';
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
        label: formatInTimeZone(Date.now(), timeZone, DateFormat.US),
        value: DateFormat.US,
      },
      {
        label: formatInTimeZone(Date.now(), timeZone, DateFormat.UK),
        value: DateFormat.UK,
      },
    ]}
    onChange={onChange}
  />
);
