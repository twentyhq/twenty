import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  differenceInSeconds,
  isThisMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useMemo, useState } from 'react';

import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { getCalendarEventEndDate } from '@/activities/calendar/utils/getCalendarEventEndDate';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { hasCalendarEventEnded } from '@/activities/calendar/utils/hasCalendarEventEnded';
import { hasCalendarEventStarted } from '@/activities/calendar/utils/hasCalendarEventStarted';
import { TimelineCalendarEvent } from '~/generated/graphql';

type CalendarCurrentEventCursorProps = {
  calendarEvent: TimelineCalendarEvent;
};

const StyledDot = styled(motion.div)`
  background-color: ${({ theme }) => theme.font.color.danger};
  border-radius: 1px;
  height: ${({ theme }) => theme.spacing(1)};
  width: ${({ theme }) => theme.spacing(1)};
`;

const StyledCurrentEventCursor = styled(motion.div)`
  align-items: center;
  background-color: ${({ theme }) => theme.font.color.danger};
  display: inline-flex;
  height: 1.5px;
  left: 0;
  position: absolute;
  right: 0;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transform: translateY(-50%);
`;

export const CalendarCurrentEventCursor = ({
  calendarEvent,
}: CalendarCurrentEventCursorProps) => {
  const theme = useTheme();
  const {
    calendarEventsByDayTime,
    currentCalendarEvent,
    getNextCalendarEvent,
    updateCurrentCalendarEvent,
  } = useContext(CalendarContext);

  const nextCalendarEvent = getNextCalendarEvent(calendarEvent);
  const nextCalendarEventStartsAt = nextCalendarEvent
    ? getCalendarEventStartDate(nextCalendarEvent)
    : undefined;
  const isNextEventThisMonth =
    !!nextCalendarEventStartsAt && isThisMonth(nextCalendarEventStartsAt);

  const calendarEventStartsAt = getCalendarEventStartDate(calendarEvent);
  const calendarEventEndsAt = getCalendarEventEndDate(calendarEvent);

  const isCurrent = currentCalendarEvent?.id === calendarEvent.id;
  const [hasStarted, setHasStarted] = useState(
    hasCalendarEventStarted(calendarEvent),
  );
  const [hasEnded, setHasEnded] = useState(
    hasCalendarEventEnded(calendarEvent),
  );
  const [isWaiting, setIsWaiting] = useState(hasEnded && !isNextEventThisMonth);

  const dayTime = startOfDay(calendarEventStartsAt).getTime();
  const dayEvents = calendarEventsByDayTime[dayTime];
  const isFirstEventOfDay = dayEvents?.slice(-1)[0] === calendarEvent;
  const isLastEventOfDay = dayEvents?.[0] === calendarEvent;

  const topOffset = isLastEventOfDay ? 9 : 6;
  const bottomOffset = isFirstEventOfDay ? 9 : 6;

  const currentEventCursorVariants = {
    beforeEvent: { top: `calc(100% + ${bottomOffset}px)` },
    eventStart: {
      top: 'calc(100% + 3px)',
      transition: {
        delay: Math.max(
          0,
          differenceInSeconds(calendarEventStartsAt, new Date()),
        ),
      },
    },
    eventEnd: {
      top: `-${topOffset}px`,
      transition: {
        delay: Math.max(
          0,
          differenceInSeconds(calendarEventEndsAt, new Date()) + 1,
        ),
      },
    },
    fadeAway: {
      opacity: 0,
      top: `-${topOffset}px`,
      transition: {
        delay:
          isWaiting && nextCalendarEventStartsAt
            ? differenceInSeconds(
                startOfMonth(nextCalendarEventStartsAt),
                new Date(),
              )
            : 0,
      },
    },
  };

  const animationSequence = useMemo(() => {
    if (!hasStarted) return { initial: 'beforeEvent', animate: 'eventStart' };

    if (!hasEnded) {
      return { initial: 'eventStart', animate: 'eventEnd' };
    }

    if (!isWaiting) {
      return { initial: undefined, animate: 'eventEnd' };
    }

    return { initial: 'eventEnd', animate: 'fadeAway' };
  }, [hasEnded, hasStarted, isWaiting]);

  return (
    <AnimatePresence>
      {isCurrent && (
        <StyledCurrentEventCursor
          key={calendarEvent.id}
          initial={animationSequence.initial}
          animate={animationSequence.animate}
          exit="fadeAway"
          variants={currentEventCursorVariants}
          onAnimationComplete={(stage) => {
            if (stage === 'eventStart') {
              setHasStarted(true);
            }

            if (stage === 'eventEnd') {
              setHasEnded(true);

              if (isNextEventThisMonth) {
                updateCurrentCalendarEvent();
              }
              // If the next event is not the same month as the current event,
              // we don't want the cursor to jump to the next month until the next month starts.
              // => Wait for the upcoming event's month to start before moving the cursor.
              // Example: we're in March. The previous event is February 15th, and the next event is April 10th.
              // We want the cursor to stay in February until April starts.
              else {
                setIsWaiting(true);
              }
            }

            if (isWaiting && stage === 'fadeAway') {
              setIsWaiting(false);
              updateCurrentCalendarEvent();
            }
          }}
          transition={{ duration: theme.animation.duration.normal }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: theme.animation.duration.normal,
              duration: theme.animation.duration.normal,
            }}
          >
            <StyledDot />
          </motion.div>
        </StyledCurrentEventCursor>
      )}
    </AnimatePresence>
  );
};
