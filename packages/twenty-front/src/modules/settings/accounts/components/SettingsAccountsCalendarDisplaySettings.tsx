import styled from '@emotion/styled';
import { useState } from 'react';

import { SettingsAccountsCalendarDateFormatSelect } from '@/settings/accounts/components/SettingsAccountsCalendarDateFormatSelect';
import { SettingsAccountsCalendarTimeFormatSelect } from '@/settings/accounts/components/SettingsAccountsCalendarTimeFormatSelect';
import { SettingsAccountsCalendarTimeZoneSelect } from '@/settings/accounts/components/SettingsAccountsCalendarTimeZoneSelect';

import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsAccountsCalendarDisplaySettings = () => {
  // TODO: use the user's saved time zone. If undefined, default it with the user's detected time zone.
  const [timeZone, setTimeZone] = useState(detectTimeZone());

  // TODO: use the user's saved date format.
  const [dateFormat, setDateFormat] = useState(DateFormat.MONTH_FIRST);

  // TODO: use the user's saved time format.
  const [timeFormat, setTimeFormat] = useState(TimeFormat['HOUR_24']);

  return (
    <StyledContainer>
      <SettingsAccountsCalendarTimeZoneSelect
        value={timeZone}
        onChange={setTimeZone}
      />
      <SettingsAccountsCalendarDateFormatSelect
        value={dateFormat}
        onChange={setDateFormat}
        timeZone={timeZone}
      />
      <SettingsAccountsCalendarTimeFormatSelect
        value={timeFormat}
        onChange={setTimeFormat}
        timeZone={timeZone}
      />
    </StyledContainer>
  );
};
