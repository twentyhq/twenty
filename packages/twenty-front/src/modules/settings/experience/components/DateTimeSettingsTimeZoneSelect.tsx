import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/settings/experience/constants/AvailableTimezoneOptions';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';

type DateTimeSettingsTimeZoneSelectProps = {
  value?: string;
  onChange: (nextValue: string) => void;
};

export const DateTimeSettingsTimeZoneSelect = ({
  value = detectTimeZone(),
  onChange,
}: DateTimeSettingsTimeZoneSelectProps) => {
  const systemTimeZone = detectTimeZone();

  const systemTimeZoneOption = findAvailableTimeZoneOption(systemTimeZone);

  return (
    <Select
      dropdownId="datetime-settings-time-zone"
      label={t`Time zone`}
      dropdownWidthAuto
      fullWidth
      value={value}
      options={[
        {
          label: isDefined(systemTimeZoneOption)
            ? t`System settings`.concat(` - ${systemTimeZoneOption.label}`)
            : t`System settings`,
          value: 'system',
        },
        ...(AVAILABLE_TIMEZONE_OPTIONS as SelectOption<string>[]),
      ]}
      onChange={onChange}
      withSearchInput
    />
  );
};
