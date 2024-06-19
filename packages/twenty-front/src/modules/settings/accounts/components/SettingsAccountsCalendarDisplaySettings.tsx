import { useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { DateTimeSettingsDateFormatSelect } from '@/settings/profile/components/DateTimeSettingsDateFormatSelect';
import { DateTimeSettingsTimeFormatSelect } from '@/settings/profile/components/DateTimeSettingsTimeFormatSelect';
import { DateTimeSettingsTimeZoneSelect } from '@/settings/profile/components/DateTimeSettingsTimeZoneSelect';
import { dateTimeFormatState } from '@/workspace-member/states/dateTimeFormatState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsAccountsCalendarDisplaySettings = () => {
  const dateTimeFormat = useRecoilValue(dateTimeFormatState);

  const [timeZone, setTimeZone] = useState(dateTimeFormat.timeZone);
  const [dateFormat, setDateFormat] = useState(dateTimeFormat.dateFormat);
  const [timeFormat, setTimeFormat] = useState(dateTimeFormat.timeFormat);

  return (
    <StyledContainer>
      <DateTimeSettingsTimeZoneSelect value={timeZone} onChange={setTimeZone} />
      <DateTimeSettingsDateFormatSelect
        value={dateFormat}
        onChange={setDateFormat}
        timeZone={timeZone}
      />
      <DateTimeSettingsTimeFormatSelect
        value={timeFormat}
        onChange={setTimeFormat}
        timeZone={timeZone}
      />
    </StyledContainer>
  );
};
