import { formatInTimeZone } from 'date-fns-tz';

import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectTimeFormat } from '@/localization/utils/detection/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';

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

  const systemTimeFormatLabel = formatInTimeZone(
    Date.now(),
    usedTimeZone,
    systemTimeFormat,
  );

  const hour24Label = formatInTimeZone(
    Date.now(),
    usedTimeZone,
    TimeFormat.HOUR_24,
  );

  const hour12Label = formatInTimeZone(
    Date.now(),
    usedTimeZone,
    TimeFormat.HOUR_12,
  );

  return (
    <Select
      dropdownId="datetime-settings-time-format"
      dropdownWidth={218}
      label={t`Time format`}
      dropdownWidthAuto
      fullWidth
      value={value}
      pinnedOption={{
        label: t`System settings`,
        value: TimeFormat.SYSTEM,
        contextualText: systemTimeFormatLabel,
      }}
      options={[
        {
          label: t`24h`,
          value: TimeFormat.HOUR_24,
          contextualText: hour24Label,
        },
        {
          label: t`12h`,
          value: TimeFormat.HOUR_12,
          contextualText: hour12Label,
        },
      ]}
      onChange={onChange}
    />
  );
};
