import { useRecoilValue } from 'recoil';

import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { resolveDateFormat } from '@/localization/utils/resolveDateFormat';
import { resolveTimeFormat } from '@/localization/utils/resolveTimeFormat';

export const useDateTimeFormat = () => {
  const workspaceMemberFormatPreferences = useRecoilValue(
    workspaceMemberFormatPreferencesState,
  );

  return {
    timeZone: workspaceMemberFormatPreferences.timeZone,
    dateFormat: resolveDateFormat(workspaceMemberFormatPreferences.dateFormat),
    timeFormat: resolveTimeFormat(workspaceMemberFormatPreferences.timeFormat),
    calendarStartDay: workspaceMemberFormatPreferences.calendarStartDay,
  };
};
