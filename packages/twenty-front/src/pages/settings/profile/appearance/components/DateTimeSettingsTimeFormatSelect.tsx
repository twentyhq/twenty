import { useLingui } from '@lingui/react/macro';
import { formatInTimeZone } from 'date-fns-tz';

import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { Select } from '@/ui/input/components/Select';

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
  const { t } = useLingui();
  const systemTimeZone = detectTimeZone();
  const usedTimeZone = timeZone === 'system' ? systemTimeZone : timeZone;
  const systemTimeFormat = TimeFormat[detectTimeFormat()];

  return (
    <Select
      dropdownId="datetime-settings-time-format"
      dropdownWidth={218}
      label={t`Time format`}
      dropdownWidthAuto
      fullWidth
      value={value}
      options={[
        {
          label: t`System Settings - ${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            systemTimeFormat,
          )}`,
          value: TimeFormat.SYSTEM,
        },
        {
          label: t`24h (${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            TimeFormat.HOUR_24,
          )})`,
          value: TimeFormat.HOUR_24,
        },
        {
          label: t`12h (${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            TimeFormat.HOUR_12,
          )})`,
          value: TimeFormat.HOUR_12,
        },
      ]}
      onChange={onChange}
    />
  );
};
