import { formatInTimeZone } from 'date-fns-tz';

import { DateFormat } from '@/localization/constants/DateFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { Select } from '@/ui/input/components/Select';

type DateTimeSettingsDateFormatSelectProps = {
  value: DateFormat;
  onChange: (nextValue: DateFormat) => void;
  timeZone: string;
};

const detectSystemDateFormat = (timeZone: string): string => {
  const knownDate = new Date(2023, 0, 2); // January 2nd, 2023
  const formattedDate = formatInTimeZone(knownDate, timeZone, 'P'); // 'P' is a localized date format

  if (formattedDate.startsWith('01')) {
    return DateFormat.MONTH_FIRST;
  } else if (formattedDate.startsWith('02')) {
    return DateFormat.DAY_FIRST;
  } else if (formattedDate.startsWith('2023')) {
    return DateFormat.YEAR_FIRST;
  } else {
    throw new Error('Unknown date format');
  }
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
          label: `System settings - ${formatInTimeZone(
            Date.now(),
            setTimeZone,
            detectSystemDateFormat(setTimeZone),
          )}`,
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
