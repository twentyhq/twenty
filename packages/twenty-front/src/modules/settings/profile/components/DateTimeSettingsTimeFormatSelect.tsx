import { formatInTimeZone } from 'date-fns-tz';

import { Select } from '@/ui/input/components/Select';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';

type DateTimeSettingsTimeFormatSelectProps = {
  value: TimeFormat;
  onChange: (nextValue: TimeFormat) => void;
  timeZone: string;
};

export const DateTimeSettingsTimeFormatSelect = ({
  onChange,
  timeZone,
  value,
}: DateTimeSettingsTimeFormatSelectProps) => (
  <Select
    dropdownId="datetime-settings-time-format"
    label="Time format"
    fullWidth
    value={value}
    options={[
      {
        label: `24h (${formatInTimeZone(
          Date.now(),
          timeZone,
          TimeFormat.Military,
        )})`,
        value: TimeFormat.Military,
      },
      {
        label: `12h (${formatInTimeZone(
          Date.now(),
          timeZone,
          TimeFormat.Standard,
        )})`,
        value: TimeFormat.Standard,
      },
    ]}
    onChange={onChange}
  />
);
