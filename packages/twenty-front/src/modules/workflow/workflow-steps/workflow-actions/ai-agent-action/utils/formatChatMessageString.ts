import { DateTime } from 'luxon';

export const formatChatMessageDate = (date: string) => {
  const dt = DateTime.fromISO(date).setLocale('en');
  const now = DateTime.local();
  if (dt.hasSame(now, 'day')) {
    return `Today at ${dt.toFormat('HH:mm')}`;
  } else if (dt.plus({ days: 1 }).hasSame(now, 'day')) {
    return `Yesterday at ${dt.toFormat('HH:mm')}`;
  } else {
    return `${dt.toFormat('MMM d, yyyy')} at ${dt.toFormat('HH:mm')}`;
  }
};
