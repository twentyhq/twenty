import { Select } from '@/ui/input/components/Select';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/workspace-member/constants/AvailableTimezoneOptions';
import { detectTimeZone } from '@/workspace-member/utils/detectTimeZone';
import { findAvailableTimeZoneOption } from '@/workspace-member/utils/findAvailableTimeZoneOption';

type DateTimeSettingsTimeZoneSelectProps = {
  value?: string;
  onChange: (nextValue: string) => void;
};

export const DateTimeSettingsTimeZoneSelect = ({
  value = detectTimeZone(),
  onChange,
}: DateTimeSettingsTimeZoneSelectProps) => (
  <Select
    dropdownId="settings-accounts-calendar-time-zone"
    dropdownWidth={416}
    label="Time zone"
    fullWidth
    value={findAvailableTimeZoneOption(value)?.value}
    options={AVAILABLE_TIMEZONE_OPTIONS}
    onChange={onChange}
    withSearchInput
  />
);
