import { useRecoilValue } from 'recoil';

import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';

export const useDateTimeFormat = () => {
  const workspaceMemberFormatPreferences = useRecoilValue(
    workspaceMemberFormatPreferencesState,
  );

  return {
    timeZone: workspaceMemberFormatPreferences.timeZone,
    dateFormat: workspaceMemberFormatPreferences.dateFormat,
    timeFormat: workspaceMemberFormatPreferences.timeFormat,
    calendarStartDay: workspaceMemberFormatPreferences.calendarStartDay,
  };
};
