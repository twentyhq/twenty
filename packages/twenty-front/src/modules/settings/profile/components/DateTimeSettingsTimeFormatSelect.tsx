import { formatInTimeZone } from 'date-fns-tz';

import { Select } from '@/ui/input/components/Select';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeFormat } from '@/workspace-member/utils/detectTimeFormat';

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
    dropdownWidth={218}
    label="Time format"
    fullWidth
    value={value}
    options={[
      {
        label: `24h (${formatInTimeZone(
          Date.now(),
          timeZone,
          TimeFormat.MILITARY,
        )}) ${
          detectTimeFormat() === TimeFormat.MILITARY ? '(System Preferred)' : ''
        }`,
        value: TimeFormat.MILITARY,
      },
      {
        label: `12h (${formatInTimeZone(
          Date.now(),
          timeZone,
          TimeFormat.STANDARD,
        )}) ${
          detectTimeFormat() === TimeFormat.STANDARD ? '(System Preferred)' : ''
        }`,
        value: TimeFormat.STANDARD,
      },
    ].sort((_, b) => (b.label.includes('(System Preferred)') ? 0 : -1))}
    onChange={onChange}
  />
);
