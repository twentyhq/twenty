import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { resolveDateFormat } from '@/localization/utils/resolveDateFormat';
import { resolveTimeFormat } from '@/localization/utils/resolveTimeFormat';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useDateTimeFormat = () => {
  const workspaceMemberFormatPreferences = useAtomValue(
    workspaceMemberFormatPreferencesState,
  );

  return {
    timeZone: workspaceMemberFormatPreferences.timeZone,
    dateFormat: resolveDateFormat(workspaceMemberFormatPreferences.dateFormat),
    timeFormat: resolveTimeFormat(workspaceMemberFormatPreferences.timeFormat),
    calendarStartDay: workspaceMemberFormatPreferences.calendarStartDay,
  };
};
