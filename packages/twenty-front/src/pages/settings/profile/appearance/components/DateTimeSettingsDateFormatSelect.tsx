import { formatInTimeZone } from 'date-fns-tz';

import { DateFormat } from '@/localization/constants/DateFormat';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';

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
  const systemTimeZone = detectTimeZone();

  const usedTimeZone = timeZone === 'system' ? systemTimeZone : timeZone;

  const systemDateFormat = DateFormat[detectDateFormat()];

  const systemDateFormatLabel = formatInTimeZone(
    Date.now(),
    usedTimeZone,
    systemDateFormat,
  );

  return (
    <Select
      dropdownId="datetime-settings-date-format"
      dropdownWidth={218}
      label="Date format"
      fullWidth
      dropdownWidthAuto
      value={value}
      options={[
        {
          label: t`System settings - ${systemDateFormatLabel}`,
          value: DateFormat.SYSTEM,
        },
        {
          label: `${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            DateFormat.MONTH_FIRST,
          )}`,
          value: DateFormat.MONTH_FIRST,
        },
        {
          label: `${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            DateFormat.DAY_FIRST,
          )}`,
          value: DateFormat.DAY_FIRST,
        },
        {
          label: `${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            DateFormat.YEAR_FIRST,
          )}`,
          value: DateFormat.YEAR_FIRST,
        },
      ]}
      onChange={onChange}
    />
  );
};
