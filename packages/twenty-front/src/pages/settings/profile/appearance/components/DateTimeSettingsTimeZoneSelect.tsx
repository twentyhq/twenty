import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/settings/accounts/constants/AvailableTimezoneOptions';
import { Select } from '@/ui/input/components/Select';

type DateTimeSettingsTimeZoneSelectProps = {
  value?: string;
  onChange: (nextValue: string) => void;
};

export const DateTimeSettingsTimeZoneSelect = ({
  value = detectTimeZone(),
  onChange,
}: DateTimeSettingsTimeZoneSelectProps) => {
  return (
    <Select
      dropdownId="settings-accounts-calendar-time-zone"
      dropdownWidth={416}
      label="Fuso horário"
      fullWidth
      value={
        value === 'system'
          ? 'Configurações do sistema'
          : findAvailableTimeZoneOption(value)?.value
      }
      options={[
        { label: 'Configurações do sistema', value: 'system' },
        ...AVAILABLE_TIMEZONE_OPTIONS,
      ]}
      onChange={onChange}
      withSearchInput
    />
  );
};
