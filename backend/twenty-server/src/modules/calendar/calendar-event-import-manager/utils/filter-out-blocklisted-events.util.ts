import { isEmailBlocklisted } from 'src/modules/blocklist/utils/is-email-blocklisted.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const filterOutBlocklistedEvents = (
  calendarChannelHandles: string[],
  events: FetchedCalendarEvent[],
  blocklist: string[],
) => {
  return events.filter((event) => {
    if (!event.participants) {
      return true;
    }

    return event.participants.every(
      (attendee) =>
        !isEmailBlocklisted(calendarChannelHandles, attendee.handle, blocklist),
    );
  });
};
