import { useState } from 'react';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { differenceInSeconds, format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { getCalendarEventEndDate } from '@/activities/calendar/utils/getCalendarEventEndDate';
import { isPastCalendarEvent } from '@/activities/calendar/utils/isPastCalendarEvent';
import { IconArrowRight, IconLock } from '@/ui/display/icon';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';

type CalendarEventRowProps = {
  calendarEvent: CalendarEvent;
  className?: string;
  isNextEvent?: boolean;
  onEventEnd?: () => void;
};

const StyledContainer = styled.div`
  align-items: center;
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(3)};
  height: ${({ theme }) => theme.spacing(6)};
  position: relative;
`;

const StyledAttendanceIndicator = styled.div<{ active?: boolean }>`
  background-color: ${({ theme }) => theme.tag.background.gray};
  height: 100%;
  width: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.xs};

  ${({ active, theme }) =>
    active &&
    css`
      background-color: ${theme.tag.background.red};
    `}
`;

const StyledLabels = styled.div`
  align-items: center;
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1 0 auto;
`;

const StyledTime = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: ${({ theme }) => theme.spacing(26)};
`;

const StyledTitle = styled.div<{ active: boolean; canceled: boolean }>`
  flex: 1 0 auto;

  ${({ theme, active }) =>
    active &&
    css`
      color: ${theme.font.color.primary};
      font-weight: ${theme.font.weight.medium};
    `}

  ${({ canceled }) =>
    canceled &&
    css`
      text-decoration: line-through;
    `}
`;

const StyledVisibilityCard = styled(Card)<{ active: boolean }>`
  color: ${({ active, theme }) =>
    active ? theme.font.color.primary : theme.font.color.light};
  border-color: ${({ theme }) => theme.border.color.light};
  flex: 1 0 auto;
  transition: color ${({ theme }) => theme.animation.duration.normal} ease;
`;

const StyledVisibilityCardContent = styled(CardContent)`
  align-items: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0, 1)};
  height: ${({ theme }) => theme.spacing(6)};
  background-color: ${({ theme }) => theme.background.transparent.lighter};
`;

const StyledNextEventIndicator = styled(motion.div)`
  align-items: center;
  background-color: ${({ theme }) => theme.font.color.danger};
  display: inline-flex;
  height: 1.5px;
  left: 0;
  position: absolute;
  right: 0;
  border-radius: ${({ theme }) => theme.border.radius.sm};

  &::before {
    background-color: ${({ theme }) => theme.font.color.danger};
    border-radius: 1px;
    content: '';
    display: block;
    height: ${({ theme }) => theme.spacing(1)};
    width: ${({ theme }) => theme.spacing(1)};
  }
`;

export const CalendarEventRow = ({
  calendarEvent,
  className,
  isNextEvent,
  onEventEnd,
}: CalendarEventRowProps) => {
  const theme = useTheme();
  const [isPastEvent, setIsPastEvent] = useState(
    isPastCalendarEvent(calendarEvent),
  );

  const endsAt = getCalendarEventEndDate(calendarEvent);
  const startTimeLabel = calendarEvent.isFullDay
    ? 'All day'
    : format(calendarEvent.startsAt, 'HH:mm');
  const endTimeLabel = calendarEvent.isFullDay ? '' : format(endsAt, 'HH:mm');

  const nextEventIndicatorVariants = {
    ended: { opacity: 0, top: theme.spacing(-1.5) },
    justEnded: { opacity: 1, top: theme.spacing(-1.5) },
    next: { top: `calc(100% + ${theme.spacing(1.5)})` },
  };

  return (
    <StyledContainer className={className}>
      <StyledAttendanceIndicator />
      <StyledLabels>
        <StyledTime>
          {startTimeLabel}
          {endTimeLabel && (
            <>
              <IconArrowRight size={theme.icon.size.sm} />
              {endTimeLabel}
            </>
          )}
        </StyledTime>
        {calendarEvent.visibility === 'METADATA' ? (
          <StyledVisibilityCard active={!isPastEvent}>
            <StyledVisibilityCardContent>
              <IconLock size={theme.icon.size.sm} />
              Not shared
            </StyledVisibilityCardContent>
          </StyledVisibilityCard>
        ) : (
          <StyledTitle
            active={!isPastEvent}
            canceled={!!calendarEvent.isCanceled}
          >
            {calendarEvent.title}
          </StyledTitle>
        )}
      </StyledLabels>
      <AnimatePresence>
        {isNextEvent && (
          <StyledNextEventIndicator
            initial="next"
            animate="justEnded"
            exit="ended"
            transition={{
              delay: differenceInSeconds(endsAt, Date.now()),
              duration: theme.animation.duration.normal,
              opacity: { delay: 0, duration: theme.animation.duration.normal },
            }}
            onAnimationComplete={() => {
              onEventEnd?.();
              setIsPastEvent(true);
            }}
            variants={nextEventIndicatorVariants}
          />
        )}
      </AnimatePresence>
    </StyledContainer>
  );
};
