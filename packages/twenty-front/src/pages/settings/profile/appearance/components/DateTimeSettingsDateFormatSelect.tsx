import { formatInTimeZone } from 'date-fns-tz';

import { DateFormat } from '@/localization/constants/DateFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { Select } from '@/ui/input/components/Select';

type DateTimeSettingsDateFormatSelectProps = {
  value: DateFormat;
  onChange: (nextValue: DateFormat) => void;
  timeZone: string;
};

export const DateTimeSettingsDateFormatSelect = ({
  onChange,
  timeZone,
  value,
}: DateTimeSettingsDateFormatSelectProps) => {
  const setTimeZone = timeZone === 'system' ? detectTimeZone() : timeZone;
  return (
    <Select
      dropdownId="datetime-settings-date-format"
      dropdownWidth={218}
      label="Date format"
      fullWidth
      value={value}
      options={[
        {
          label: `System settings`,
          value: DateFormat.SYSTEM,
        },
        {
          label: `${formatInTimeZone(
            Date.now(),
            setTimeZone,
            DateFormat.MONTH_FIRST,
          )}`,
          value: DateFormat.MONTH_FIRST,
        },
        {
          label: `${formatInTimeZone(
            Date.now(),
            setTimeZone,
            DateFormat.DAY_FIRST,
          )}`,
          value: DateFormat.DAY_FIRST,
        },
        {
          label: `${formatInTimeZone(
            Date.now(),
            setTimeZone,
            DateFormat.YEAR_FIRST,
          )}`,
          value: DateFormat.YEAR_FIRST,
        },
      ]}
      onChange={onChange}
    />
  );
};
