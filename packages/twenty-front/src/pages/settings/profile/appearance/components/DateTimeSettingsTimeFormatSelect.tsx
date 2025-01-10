import { formatInTimeZone } from 'date-fns-tz';

import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { Select } from '@/ui/input/components/Select';
import { useTranslation } from 'react-i18next';

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
  const systemTimeZone = detectTimeZone();

  const usedTimeZone = timeZone === 'system' ? systemTimeZone : timeZone;

  const systemTimeFormat = TimeFormat[detectTimeFormat()];

  const { t } = useTranslation();

  return (
    <Select
      dropdownId="datetime-settings-time-format"
      dropdownWidth={218}
      label={t('timeFormat')}
      dropdownWidthAuto
      fullWidth
      value={value}
      options={[
        {
          label: `${t('systemSettings')} - ${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            systemTimeFormat,
          )}`,
          value: TimeFormat.SYSTEM,
        },
        {
          label: `24h (${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            TimeFormat.HOUR_24,
          )})`,
          value: TimeFormat.HOUR_24,
        },
        {
          label: `12h (${formatInTimeZone(
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
