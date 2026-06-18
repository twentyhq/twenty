import { useMemo } from 'react';
import {
  Calendar,
  type CalendarProps,
  dateFnsLocalizer,
  type Components,
  type SlotInfo,
  type View,
} from 'react-big-calendar';
import withDragAndDrop, {
  type EventInteractionArgs,
} from 'react-big-calendar/lib/addons/dragAndDrop';
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

// The drag-and-drop addon (§3 reschedule / §7 / §15). It wraps the base Calendar,
// adding onEventDrop + a draggableAccessor. We keep the same generic so the custom
// EventPill renderer and our event shape carry through unchanged. Typed to our
// event so onEventDrop's args are narrowed.
const DnDCalendar = withDragAndDrop<SocialCalendarEvent>(
  Calendar as React.ComponentType<CalendarProps<SocialCalendarEvent>>,
);

// Only DRAFT + SCHEDULED posts can be rescheduled (§7). POSTED/PUBLISHING/FAILED
// are locked — the draggableAccessor returns false for them so the addon shows a
// no-drop cursor and never fires onEventDrop for a locked pill.
const RESCHEDULABLE: ReadonlySet<string> = new Set(['DRAFT', 'SCHEDULED']);
const isReschedulable = (event: SocialCalendarEvent): boolean =>
  RESCHEDULABLE.has(event.post.status);

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
  onSelectSlot,
  onCompose,
  onReschedule,
  hasAnyPosts,
}: {
  events: SocialCalendarEvent[];
  view: SocialCalendarView;
  date: Date;
  onView: (view: SocialCalendarView) => void;
  onNavigate: (date: Date) => void;
  onSelectEvent: (event: SocialCalendarEvent) => void;
  // S3: clicking an empty day/slot opens the composer prefilled with that date.
  onSelectSlot: (start: Date) => void;
  // S3: the no-posts empty-state CTA opens a blank composer.
  onCompose: () => void;
  // S4: dropping a DRAFT/SCHEDULED pill on a new day fires this with the post +
  // the new start instant. The page applies it optimistically and calls save-post.
  onReschedule: (event: SocialCalendarEvent, newStart: Date) => void;
  hasAnyPosts: boolean;
}) => {
  // Stamp the status className (status-specific layout) and a "locked" class on
  // non-reschedulable pills so the stylesheet can show a no-drop cursor (§7).
  const eventPropGetter = useMemo(
    () => (event: SocialCalendarEvent) => ({
      className: [
        `rbc-event--${event.post.status.toLowerCase()}`,
        isReschedulable(event) ? '' : 'rbc-event--locked',
      ]
        .filter(Boolean)
        .join(' '),
    }),
    [],
  );

  // S4 drop handler. The addon only fires this for draggable (DRAFT/SCHEDULED)
  // pills, but we guard again defensively and normalize `start` to a Date.
  const handleEventDrop = ({ event, start }: EventInteractionArgs<SocialCalendarEvent>) => {
    if (!isReschedulable(event)) return;
    const newStart = start instanceof Date ? start : new Date(start);
    if (Number.isNaN(newStart.getTime())) return;
    onReschedule(event, newStart);
  };

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
          <DnDCalendar
            localizer={localizer}
            events={events}
            view={view}
            views={VIEWS}
            date={date}
            onView={(next) => onView(next as SocialCalendarView)}
            onNavigate={(next) => onNavigate(next)}
            onSelectEvent={onSelectEvent}
            // Clicking an empty day cell (or a week/day slot) opens the composer
            // prefilled with that date (§4.1 hover-"+" / §3 "reachable from
            // calendar day +"). We pass the slot's start instant straight through.
            selectable
            onSelectSlot={(slot: SlotInfo) => onSelectSlot(slot.start)}
            // S4 drag-to-reschedule: only DRAFT/SCHEDULED are draggable; resize is
            // off (a pill is a point-in-time post, not a range). onEventDrop fires
            // on a valid drop; the page does the optimistic move + save-post.
            draggableAccessor={isReschedulable}
            resizable={false}
            onEventDrop={handleEventDrop}
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
          <CalendarEmptyNoPosts onCompose={onCompose} />
        </div>
      ) : null}
    </StyledSocialCalendarShell>
  );
};
