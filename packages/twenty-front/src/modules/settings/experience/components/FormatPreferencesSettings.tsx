import { styled } from '@linaria/react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { DateFormat } from '@/localization/constants/DateFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useFormatPreferences } from '@/localization/hooks/useFormatPreferences';
import { DateTimeSettingsCalendarSystemSelect } from '@/settings/experience/components/DateTimeSettingsCalendarSystemSelect';
import { DateTimeSettingsDateFormatSelect } from '@/settings/experience/components/DateTimeSettingsDateFormatSelect';
import { DateTimeSettingsTimeFormatSelect } from '@/settings/experience/components/DateTimeSettingsTimeFormatSelect';
import { DateTimeSettingsTimeZoneSelect } from '@/settings/experience/components/DateTimeSettingsTimeZoneSelect';
import { NumberFormatSelect } from '@/settings/experience/components/NumberFormatSelect';
import { CalendarStartDay } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import {
  WorkspaceMemberCalendarSystemEnum,
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberNumberFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from '~/generated-metadata/graphql';
import { DateTimeSettingsCalendarStartDaySelect } from '~/pages/settings/profile/appearance/components/DateTimeSettingsCalendarStartDaySelect';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const FormatPreferencesSettings = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
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

  const handleCalendarSystemChange = (value: CalendarSystem) => {
    updateFormatPreference('calendarSystem', value);
  };

  const handleCalendarStartDayChange = (value: CalendarStartDay) => {
    updateFormatPreference('calendarStartDay', value);
  };

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

  const displayCalendarSystem =
    currentWorkspaceMember.calendarSystem ===
    WorkspaceMemberCalendarSystemEnum.SYSTEM
      ? CalendarSystem.SYSTEM
      : formatPreferences.calendarSystem;

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
      <DateTimeSettingsCalendarSystemSelect
        value={displayCalendarSystem}
        onChange={handleCalendarSystemChange}
      />
      <DateTimeSettingsDateFormatSelect
        value={displayDateFormat}
        onChange={handleDateFormatChange}
        timeZone={displayTimeZone}
        calendarSystem={formatPreferences.calendarSystem}
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
