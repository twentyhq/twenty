import { useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { DateTimeSettingsDateFormatSelect } from '@/settings/profile/components/DateTimeSettingsDateFormatSelect';
import { DateTimeSettingsTimeFormatSelect } from '@/settings/profile/components/DateTimeSettingsTimeFormatSelect';
import { DateTimeSettingsTimeZoneSelect } from '@/settings/profile/components/DateTimeSettingsTimeZoneSelect';
import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeZone } from '@/workspace-member/utils/detectTimeZone';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsAccountsCalendarDisplaySettings = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [timeZone, setTimeZone] = useState(
    currentWorkspaceMember?.timeZone ?? detectTimeZone(),
  );
  const [dateFormat, setDateFormat] = useState(
    (currentWorkspaceMember?.dateFormat as DateFormat) ??
      DateFormat.MONTH_FIRST,
  );
  const [timeFormat, setTimeFormat] = useState(
    (currentWorkspaceMember?.timeFormat as TimeFormat) ?? TimeFormat.MILITARY,
  );

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
