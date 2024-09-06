import { formatInTimeZone } from 'date-fns-tz';

import { TimeFormat } from '@/localization/constants/TimeFormat';
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
  const setTimeZone = timeZone === 'system' ? detectTimeZone() : timeZone;
  return (
    <Select
      dropdownId="datetime-settings-time-format"
      dropdownWidth={218}
      label="Formato de hora"
      fullWidth
      value={value}
      options={[
        {
          label: 'Configurações do sistema',
          value: TimeFormat.SYSTEM,
        },
        {
          label: `24h (${formatInTimeZone(
            Date.now(),
            setTimeZone,
            TimeFormat.HOUR_24,
          )})`,
          value: TimeFormat.HOUR_24,
        },
        {
          label: `12h (${formatInTimeZone(
            Date.now(),
            setTimeZone,
            TimeFormat.HOUR_12,
          )})`,
          value: TimeFormat.HOUR_12,
        },
      ]}
      onChange={onChange}
    />
  );
};
