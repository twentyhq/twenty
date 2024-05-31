import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { DateTimeSettingsDateFormatSelect } from '@/settings/profile/components/DateTimeSettingsDateFormatSelect';
import { DateTimeSettingsTimeFormatSelect } from '@/settings/profile/components/DateTimeSettingsTimeFormatSelect';
import { DateTimeSettingsTimeZoneSelect } from '@/settings/profile/components/DateTimeSettingsTimeZoneSelect';
import { dateFormatState } from '@/workspace-member/states/dateFormatState';
import { timeFormatState } from '@/workspace-member/states/timeFormatState';
import { timeZoneState } from '@/workspace-member/states/timezoneState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const DateTimeSettings = () => {
  const [timeZone, setTimeZone] = useRecoilState(timeZoneState);

  const [dateFormat, setDateFormat] = useRecoilState(dateFormatState);

  const [timeFormat, setTimeFormat] = useRecoilState(timeFormatState);

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
