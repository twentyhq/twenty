import { formatInTimeZone } from 'date-fns-tz';

import { Select } from '@/ui/input/components/Select';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeZone } from '@/workspace-member/utils/detectTimeZone';

type DateTimeSettingsTimeFormatSelectProps = {
  value: TimeFormat;
  onChange: (nextValue: TimeFormat) => void;
  timeZone: string;
};

export const DateTimeSettingsTimeFormatSelect = ({
  onChange,
  timeZone,
  value,
}: DateTimeSettingsTimeFormatSelectProps) => {
  const setTimeZone = timeZone === 'system' ? detectTimeZone() : timeZone;
  return (
    <Select
      dropdownId="datetime-settings-time-format"
      dropdownWidth={218}
      label="Time format"
      fullWidth
      value={value}
      options={[
        {
          label: 'System settings',
          value: TimeFormat.SYSTEM,
        },
        {
          label: `24h (${formatInTimeZone(
            Date.now(),
            setTimeZone,
            TimeFormat.MILITARY,
          )})`,
          value: TimeFormat.MILITARY,
        },
        {
          label: `12h (${formatInTimeZone(
            Date.now(),
            setTimeZone,
            TimeFormat.STANDARD,
          )})`,
          value: TimeFormat.STANDARD,
        },
      ]}
      onChange={onChange}
    />
  );
};
