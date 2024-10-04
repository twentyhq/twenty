import { formatInTimeZone } from 'date-fns-tz';

import { TimeFormat } from '@/localization/constants/TimeFormat';
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
          TimeFormat.HOUR_24,
        )})`,
        value: TimeFormat.HOUR_24,
      },
      {
        label: `12h (${formatInTimeZone(
          Date.now(),
          timeZone,
          TimeFormat.HOUR_12,
        )})`,
        value: TimeFormat.HOUR_12,
      },
    ]}
    onChange={onChange}
  />
);
