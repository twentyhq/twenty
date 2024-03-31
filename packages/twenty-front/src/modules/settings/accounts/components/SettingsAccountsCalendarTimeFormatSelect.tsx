import { formatInTimeZone } from 'date-fns-tz';

import { TimeFormat } from '@/settings/accounts/constants/TimeFormat';
import { Select } from '@/ui/input/components/Select';

type SettingsAccountsCalendarTimeFormatSelectProps = {
  value: TimeFormat;
  onChange: (nextValue: TimeFormat) => void;
  timeZone: string;
};

export const SettingsAccountsCalendarTimeFormatSelect = ({
  onChange,
  timeZone,
  value,
}: SettingsAccountsCalendarTimeFormatSelectProps) => (
  <Select
    dropdownId="settings-accounts-calendar-time-format"
    label="Time format"
    fullWidth
    value={value}
    options={[
      {
        label: `24h (${formatInTimeZone(
          Date.now(),
          timeZone,
          TimeFormat['24h'],
        )})`,
        value: TimeFormat['24h'],
      },
      {
        label: `12h (${formatInTimeZone(
          Date.now(),
          timeZone,
          TimeFormat['12h'],
        )})`,
        value: TimeFormat['12h'],
      },
    ]}
    onChange={onChange}
  />
);
