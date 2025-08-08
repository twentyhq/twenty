import styled from '@emotion/styled';
import { useState } from 'react';

import { DateTimeSettingsDateFormatSelect } from '@/settings/experience/components/DateTimeSettingsDateFormatSelect';
import { DateTimeSettingsTimeFormatSelect } from '@/settings/experience/components/DateTimeSettingsTimeFormatSelect';
import { DateTimeSettingsTimeZoneSelect } from '@/settings/experience/components/DateTimeSettingsTimeZoneSelect';

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
