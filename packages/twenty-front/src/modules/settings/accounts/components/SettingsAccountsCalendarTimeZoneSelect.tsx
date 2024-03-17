import { Select } from 'twenty-ui';

import { AVAILABLE_TIMEZONE_OPTIONS } from '@/settings/accounts/constants/AvailableTimezoneOptions';
import { detectTimeZone } from '@/settings/accounts/utils/detectTimeZone';
import { findAvailableTimeZoneOption } from '@/settings/accounts/utils/findAvailableTimeZoneOption';

type SettingsAccountsCalendarTimeZoneSelectProps = {
  value?: string;
  onChange: (nextValue: string) => void;
};

export const SettingsAccountsCalendarTimeZoneSelect = ({
  value = detectTimeZone(),
  onChange,
}: SettingsAccountsCalendarTimeZoneSelectProps) => (
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
