import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { resolveDateFormat } from '@/localization/utils/resolveDateFormat';
import { resolveTimeFormat } from '@/localization/utils/resolveTimeFormat';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useDateTimeFormat = () => {
  const workspaceMemberFormatPreferences = useRecoilValueV2(
    workspaceMemberFormatPreferencesState,
  );

  return {
    timeZone: workspaceMemberFormatPreferences.timeZone,
    dateFormat: resolveDateFormat(workspaceMemberFormatPreferences.dateFormat),
    timeFormat: resolveTimeFormat(workspaceMemberFormatPreferences.timeFormat),
    calendarStartDay: workspaceMemberFormatPreferences.calendarStartDay,
  };
};
