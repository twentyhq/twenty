import { availableTimeZoneOptions } from '@/settings/accounts/constants/timeZoneSelectOptions';
import { detectTimeZone } from '@/settings/accounts/utils/detectTimeZone';
import { findAvailableTimeZoneOption } from '@/settings/accounts/utils/findAvailableTimeZoneOption';
import { Select } from '@/ui/input/components/Select';

type SettingsAccountsCalendarsTimeZoneSelectProps = {
  value?: string;
  onChange: (nextValue: string) => void;
};

export const SettingsAccountsCalendarsTimeZoneSelect = ({
  value = detectTimeZone(),
  onChange,
}: SettingsAccountsCalendarsTimeZoneSelectProps) => (
  <Select
    dropdownId="settings-accounts-calendar-time-zone"
    dropdownWidth={416}
    label="Time zone"
    fullWidth
    value={findAvailableTimeZoneOption(value)?.value}
    options={availableTimeZoneOptions}
    onChange={onChange}
    withSearchInput
  />
);
