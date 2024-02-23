import { useState } from 'react';
import styled from '@emotion/styled';
import { formatInTimeZone } from 'date-fns-tz';

import { SettingsAccountsCalendarTimeZoneSelect } from '@/settings/accounts/components/SettingsAccountsCalendarTimeZoneSelect';
import { detectTimeZone } from '@/settings/accounts/utils/detectTimeZone';
import { Select } from '@/ui/input/components/Select';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsAccountsCalendarDisplaySettings = () => {
  // TODO: use the user's saved time zone. If undefined, default it with the user's detected time zone.
  const [timeZone, setTimeZone] = useState(detectTimeZone());

  // TODO: use the user's saved time format.
  const [timeFormat, setTimeFormat] = useState<12 | 24>(24);

  return (
    <StyledContainer>
      <SettingsAccountsCalendarTimeZoneSelect
        value={timeZone}
        onChange={setTimeZone}
      />
      <Select
        dropdownId="settings-accounts-calendar-time-format"
        label="Format"
        fullWidth
        value={timeFormat}
        options={[
          {
            label: `24h (${formatInTimeZone(Date.now(), timeZone, 'HH:mm')})`,
            value: 24,
          },
          {
            label: `12h (${formatInTimeZone(Date.now(), timeZone, 'h:mm aa')})`,
            value: 12,
          },
        ]}
        onChange={setTimeFormat}
      />
    </StyledContainer>
  );
};
