import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';
import { createTimeZoneOptions } from '@/settings/accounts/constants/AvailableTimezoneOptions';
import { VirtualizedSelect } from '@/ui/input/components/VirtualizedSelect';
import { useMemo, useState } from 'react';
import { isDefined } from '~/utils/isDefined';


type DateTimeSettingsTimeZoneSelectProps = {
  value?: string;
  onChange: (nextValue: string) => void;
};

export const DateTimeSettingsTimeZoneSelect = ({
  value = detectTimeZone(),
  onChange,
}: DateTimeSettingsTimeZoneSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const systemTimeZone = detectTimeZone();
  const systemTimeZoneOption = findAvailableTimeZoneOption(systemTimeZone);

  const filteredOptions = useMemo(() => {
    const allOptions = createTimeZoneOptions();
    if (!searchQuery) return allOptions;

    const query = searchQuery.toLowerCase();
    return allOptions.filter(option => 
      option.label.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const allOptions = useMemo(() => {
    const systemOption = {
      label: isDefined(systemTimeZoneOption)
        ? `System settings - ${systemTimeZoneOption.label}`
        : 'System settings',
      value: 'system',
    };
    return [systemOption, ...filteredOptions];
  }, [filteredOptions, systemTimeZoneOption]);

  return (
    <VirtualizedSelect
      dropdownId="settings-accounts-calendar-time-zone"
      label="Time zone"
      dropdownWidthAuto
      fullWidth
      value={value}
      options={allOptions}
      onChange={onChange}
      itemHeight={40}
      maxHeight={300}
      withSearchInput
    />
  );
};
