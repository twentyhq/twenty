import { formatInTimeZone } from 'date-fns-tz';

import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { resolveDateFormat } from '@/localization/utils/resolveDateFormat';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const getFormattedTodayDate = () => {
  const { timeZone, dateFormat } = jotaiStore.get(
    workspaceMemberFormatPreferencesState.atom,
  );

  return formatInTimeZone(new Date(), timeZone, resolveDateFormat(dateFormat));
};
