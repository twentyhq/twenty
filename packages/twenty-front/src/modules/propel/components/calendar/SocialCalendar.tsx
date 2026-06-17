import { useMemo } from 'react';
import {
  Calendar,
  dateFnsLocalizer,
  type Components,
  type View,
} from 'react-big-calendar';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarToolbar } from '@/propel/components/calendar/CalendarToolbar';
import { EventPill } from '@/propel/components/calendar/EventPill';
import { CalendarEmptyNoPosts } from '@/propel/components/calendar/CalendarStates';
import { StyledSocialCalendarShell } from '@/propel/components/calendar/socialCalendarStyles';
import {
  type SocialCalendarEvent,
  type SocialCalendarView,
} from '@/propel/types/socialCalendar';

// date-fns v2 localizer (date-fns is already a fork dep; no moment/dayjs needed).
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Limit the views to the three S1 surfaces (Month / Week / List=agenda).
const VIEWS: View[] = ['month', 'week', 'agenda'];

// Custom renderers shared across views. `agenda.event` reuses the same pill so
// the List view reads identically to the grid.
const components: Components<SocialCalendarEvent> = {
  toolbar: CalendarToolbar,
  event: EventPill,
  agenda: { event: EventPill },
};

// The native posting calendar (§4). Controlled date + view live in the page so
// the header SegmentedControl and keyboard nav stay in sync. eventPropGetter
// stamps the status className so the stylesheet can hook per-status layout.
export const SocialCalendar = ({
  events,
  view,
  date,
  onView,
  onNavigate,
  onSelectEvent,
  hasAnyPosts,
}: {
  events: SocialCalendarEvent[];
  view: SocialCalendarView;
  date: Date;
  onView: (view: SocialCalendarView) => void;
  onNavigate: (date: Date) => void;
  onSelectEvent: (event: SocialCalendarEvent) => void;
  hasAnyPosts: boolean;
}) => {
  const eventPropGetter = useMemo(
    () => (event: SocialCalendarEvent) => ({
      className: `rbc-event--${event.post.status.toLowerCase()}`,
    }),
    [],
  );

  return (
    <StyledSocialCalendarShell>
      {/* View-switch crossfade (§15): content-only fade keyed on the view so
          Month↔Week↔List reads as one surface morphing, not a page jump. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.24,
            ease: [0.77, 0, 0.175, 1],
          }}
          style={{ flex: 1, minHeight: 0, display: 'flex' }}
        >
          <Calendar<SocialCalendarEvent>
            localizer={localizer}
            events={events}
            view={view}
            views={VIEWS}
            date={date}
            onView={(next) => onView(next as SocialCalendarView)}
            onNavigate={(next) => onNavigate(next)}
            onSelectEvent={onSelectEvent}
            components={components}
            eventPropGetter={eventPropGetter}
            popup
            startAccessor="start"
            endAccessor="end"
            style={{ flex: 1, minHeight: 0 }}
            // Empty-range copy comes from our own overlay below; rbc's agenda
            // empty message is plain text, so we suppress the grid empty noise.
            messages={{
              noEventsInRange: hasAnyPosts
                ? 'No posts in this range.'
                : 'No posts scheduled.',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* When there are zero posts overall, overlay the friendly compose CTA so
          an empty month doesn't read as "broken". (§5 empty — channels but no
          posts.) The grid still renders behind it for orientation. */}
      {!hasAnyPosts ? (
        <div style={{ paddingTop: 12 }}>
          <CalendarEmptyNoPosts />
        </div>
      ) : null}
    </StyledSocialCalendarShell>
  );
};
