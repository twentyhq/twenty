import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { DateFormat } from '@/localization/constants/DateFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useFormatPreferences } from '@/localization/hooks/useFormatPreferences';
import { DateTimeSettingsDateFormatSelect } from '@/settings/experience/components/DateTimeSettingsDateFormatSelect';
import { DateTimeSettingsTimeFormatSelect } from '@/settings/experience/components/DateTimeSettingsTimeFormatSelect';
import { DateTimeSettingsTimeZoneSelect } from '@/settings/experience/components/DateTimeSettingsTimeZoneSelect';
import { NumberFormatSelect } from '@/settings/experience/components/NumberFormatSelect';
import { CalendarStartDay } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberNumberFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from '~/generated/graphql';
import { DateTimeSettingsCalendarStartDaySelect } from '~/pages/settings/profile/appearance/components/DateTimeSettingsCalendarStartDaySelect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const FormatPreferencesSettings = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { formatPreferences, updateFormatPreference } = useFormatPreferences();

  if (!isDefined(currentWorkspaceMember)) return null;

  const handleTimeZoneChange = (value: string) => {
    updateFormatPreference('timeZone', value);
  };

  const handleDateFormatChange = (value: DateFormat) => {
    updateFormatPreference('dateFormat', value);
  };

  const handleTimeFormatChange = (value: TimeFormat) => {
    updateFormatPreference('timeFormat', value);
  };

  const handleNumberFormatChange = (value: NumberFormat) => {
    updateFormatPreference('numberFormat', value);
  };

  const handleCalendarStartDayChange = (value: CalendarStartDay) => {
    updateFormatPreference('calendarStartDay', value);
  };

  // Convert workspace member values to display values
  const displayTimeZone =
    currentWorkspaceMember.timeZone === 'system'
      ? 'system'
      : formatPreferences.timeZone;

  const displayDateFormat =
    currentWorkspaceMember.dateFormat === WorkspaceMemberDateFormatEnum.SYSTEM
      ? DateFormat.SYSTEM
      : formatPreferences.dateFormat;

  const displayTimeFormat =
    currentWorkspaceMember.timeFormat === WorkspaceMemberTimeFormatEnum.SYSTEM
      ? TimeFormat.SYSTEM
      : formatPreferences.timeFormat;

  const displayNumberFormat =
    currentWorkspaceMember.numberFormat ===
    WorkspaceMemberNumberFormatEnum.SYSTEM
      ? NumberFormat.SYSTEM
      : formatPreferences.numberFormat;

  const displayCalendarStartDay: CalendarStartDay =
    currentWorkspaceMember.calendarStartDay === null ||
    currentWorkspaceMember.calendarStartDay === CalendarStartDay.SYSTEM
      ? CalendarStartDay.SYSTEM
      : formatPreferences.calendarStartDay;

  return (
    <StyledContainer>
      <DateTimeSettingsTimeZoneSelect
        value={displayTimeZone}
        onChange={handleTimeZoneChange}
      />
      <DateTimeSettingsDateFormatSelect
        value={displayDateFormat}
        onChange={handleDateFormatChange}
        timeZone={displayTimeZone}
      />
      <DateTimeSettingsTimeFormatSelect
        value={displayTimeFormat}
        onChange={handleTimeFormatChange}
        timeZone={displayTimeZone}
      />
      <NumberFormatSelect
        value={displayNumberFormat}
        onChange={handleNumberFormatChange}
      />
      <DateTimeSettingsCalendarStartDaySelect
        value={displayCalendarStartDay}
        onChange={handleCalendarStartDayChange}
      />
    </StyledContainer>
  );
};
