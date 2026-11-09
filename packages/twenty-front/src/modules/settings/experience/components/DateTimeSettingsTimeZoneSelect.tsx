import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/localization/constants/AvailableTimezoneOptions';
import { Select } from '@/ui/input/components/Select';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { useLingui } from '@lingui/react/macro';

type DateTimeSettingsTimeZoneSelectProps = {
  value?: string;
  onChange: (nextValue: string) => void;
};

export const DateTimeSettingsTimeZoneSelect = ({
  value = detectTimeZone(),
  onChange,
}: DateTimeSettingsTimeZoneSelectProps) => {
  const { t } = useLingui();
  const systemTimeZone = detectTimeZone();

  const systemTimeZoneOption = findAvailableTimeZoneOption(systemTimeZone);

  return (
    <Select
      dropdownId="datetime-settings-time-zone"
      label={t`Time zone`}
      dropdownWidth={480}
      fullWidth
      value={value}
      pinnedOption={{
        label: t`System settings`,
        value: 'system',
        contextualText: systemTimeZoneOption?.label,
      }}
      options={AVAILABLE_TIMEZONE_OPTIONS as SelectOption<string>[]}
      onChange={onChange}
      withSearchInput
    />
  );
};
