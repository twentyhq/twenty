import { differenceInCalendarDays, isValid } from 'date-fns';

import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const RELATIVE_ACTIVITY_TIME_MAX_DAYS = 7;

// Recent activity reads as "now", "2h" or "3d", older activity as its date
export const formatAgentChatThreadActivityTime = (activityAt: string) => {
  const activityDate = new Date(activityAt);

  if (!isValid(activityDate)) {
    return '';
  }

  if (
    differenceInCalendarDays(new Date(), activityDate) <
    RELATIVE_ACTIVITY_TIME_MAX_DAYS
  ) {
    return beautifyPastDateRelativeToNowShort(activityDate);
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(activityDate);
};
