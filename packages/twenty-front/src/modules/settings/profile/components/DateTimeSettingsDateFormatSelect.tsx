import { formatInTimeZone } from 'date-fns-tz';

import { Select } from '@/ui/input/components/Select';
import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { detectDateFormat } from '@/workspace-member/utils/detectDateFormat';

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
    dropdownWidth={218}
    label="Date format"
    fullWidth
    value={value}
    options={[
      {
        label: `${formatInTimeZone(
          Date.now(),
          timeZone,
          DateFormat.MONTH_FIRST,
        )} ${
          detectDateFormat() === DateFormat.MONTH_FIRST
            ? '(System Preferred)'
            : ''
        }`,
        value: DateFormat.MONTH_FIRST,
      },
      {
        label: `${formatInTimeZone(
          Date.now(),
          timeZone,
          DateFormat.DAY_FIRST,
        )} ${
          detectDateFormat() === DateFormat.DAY_FIRST
            ? '(System Preferred)'
            : ''
        }`,
        value: DateFormat.DAY_FIRST,
      },
      {
        label: `${formatInTimeZone(
          Date.now(),
          timeZone,
          DateFormat.YEAR_FIRST,
        )} ${
          detectDateFormat() === DateFormat.YEAR_FIRST
            ? '(System Preferred)'
            : ''
        }`,
        value: DateFormat.YEAR_FIRST,
      },
    ].sort((_, b) => (b.label.includes('(System Preferred)') ? 0 : -1))}
    onChange={onChange}
  />
);
