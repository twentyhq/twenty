import { isNonEmptyString } from '@sniptt/guards';

import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';

export const getGranolaNoteTitle = (
  note: Pick<GranolaNote, 'title' | 'calendar_event'>,
): string | undefined => {
  const title = note.title?.trim();

  if (isNonEmptyString(title)) {
    return title;
  }

  const calendarTitle = note.calendar_event?.event_title?.trim();

  return isNonEmptyString(calendarTitle) ? calendarTitle : undefined;
};
