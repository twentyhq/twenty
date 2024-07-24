import { Select } from '@/ui/input/components/Select';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/workspace-member/constants/AvailableTimezoneOptions';
import { findAvailableTimeZoneOption } from '@/workspace-member/utils/findAvailableTimeZoneOption';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';

type DateTimeSettingsTimeZoneSelectProps = {
  value?: string | null | undefined;
  onChange: (nextValue: string) => void;
};

export const DateTimeSettingsTimeZoneSelect = ({
  value,
  onChange,
}: DateTimeSettingsTimeZoneSelectProps) => {
  const parsedValue = useMemo(() => {
    return value === 'system'
      ? 'System settings'
      : isNonEmptyString(value)
        ? findAvailableTimeZoneOption(value)?.value
        : null;
  }, [value]);

  return (
    <Select
      dropdownId="settings-accounts-calendar-time-zone"
      dropdownWidth={416}
      label="Time zone"
      fullWidth
      value={parsedValue}
      options={[
        { label: 'System settings', value: 'system' },
        ...AVAILABLE_TIMEZONE_OPTIONS,
      ]}
      onChange={onChange}
      withSearchInput
    />
  );
};
