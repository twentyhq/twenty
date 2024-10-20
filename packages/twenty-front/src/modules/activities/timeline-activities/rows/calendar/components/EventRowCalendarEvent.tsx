import styled from '@emotion/styled';
import { useState } from 'react';

import { EventCardCalendarEvent } from '@/activities/timeline-activities/rows/calendar/components/EventCardCalendarEvent';
import { EventCard } from '@/activities/timeline-activities/rows/components/EventCard';
import { EventCardToggleButton } from '@/activities/timeline-activities/rows/components/EventCardToggleButton';
import {
  EventRowDynamicComponentProps,
  StyledEventRowItemAction,
  StyledEventRowItemColumn,
} from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';

type EventRowCalendarEventProps = EventRowDynamicComponentProps;

const StyledEventRowCalendarEventContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const EventRowCalendarEvent = ({
  event,
  authorFullName,
  labelIdentifierValue,
}: EventRowCalendarEventProps) => {
  const [, eventAction] = event.name.split('.');
  const [isOpen, setIsOpen] = useState(false);

  if (['linked'].includes(eventAction) === false) {
    throw new Error('Invalid event action for calendarEvent event type.');
  }

  return (
    <StyledEventRowCalendarEventContainer>
      <StyledRowContainer>
        <StyledEventRowItemColumn>{authorFullName}</StyledEventRowItemColumn>
        <StyledEventRowItemAction>
          linked a calendar event with {labelIdentifierValue}
        </StyledEventRowItemAction>
        <EventCardToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
      </StyledRowContainer>
      <EventCard isOpen={isOpen}>
        <EventCardCalendarEvent calendarEventId={event.linkedRecordId} />
      </EventCard>
    </StyledEventRowCalendarEventContainer>
  );
};
