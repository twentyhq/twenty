import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { resolveDateFormat } from '@/localization/utils/resolveDateFormat';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const getFormattedTodayDate = () => {
  const { timeZone, dateFormat } = jotaiStore.get(
    workspaceMemberFormatPreferencesState.atom,
  );

  return formatDateISOStringToDate({
    date: new Date().toISOString(),
    timeZone,
    dateFormat: resolveDateFormat(dateFormat),
  });
};
