import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/settings/accounts/constants/AvailableTimezoneOptions';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

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
      dropdownId="settings-accounts-calendar-time-zone"
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
        ...AVAILABLE_TIMEZONE_OPTIONS,
      ]}
      onChange={onChange}
      withSearchInput
    />
  );
};
