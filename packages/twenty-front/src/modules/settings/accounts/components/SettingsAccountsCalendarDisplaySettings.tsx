import styled from '@emotion/styled';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useFormatPreferences } from '@/localization/hooks/useFormatPreferences';
import { DateTimeSettingsDateFormatSelect } from '@/settings/experience/components/DateTimeSettingsDateFormatSelect';
import { DateTimeSettingsTimeFormatSelect } from '@/settings/experience/components/DateTimeSettingsTimeFormatSelect';
import { DateTimeSettingsTimeZoneSelect } from '@/settings/experience/components/DateTimeSettingsTimeZoneSelect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsAccountsCalendarDisplaySettings = () => {
  const { timeZone, dateFormat, timeFormat } = useDateTimeFormat();
  const { updateFormatPreference } = useFormatPreferences();

  return (
    <StyledContainer>
      <DateTimeSettingsTimeZoneSelect
        value={timeZone}
        onChange={(value) => updateFormatPreference('timeZone', value)}
      />
      <DateTimeSettingsDateFormatSelect
        value={dateFormat}
        onChange={(value) => updateFormatPreference('dateFormat', value)}
        timeZone={timeZone}
      />
      <DateTimeSettingsTimeFormatSelect
        value={timeFormat}
        onChange={(value) => updateFormatPreference('timeFormat', value)}
        timeZone={timeZone}
      />
    </StyledContainer>
  );
};
