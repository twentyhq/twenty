import { useState } from 'react';
import styled from '@emotion/styled';

import { EventCardCalendarEvent } from '@/activities/timelineActivities/rows/calendar/components/EventCardCalendarEvent';
import {
  EventCard,
  EventCardToggleButton,
} from '@/activities/timelineActivities/rows/components/EventCard';
import {
  EventRowDynamicComponentProps,
  StyledItemAction,
  StyledItemAuthorText,
} from '@/activities/timelineActivities/rows/components/EventRowDynamicComponent';

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

export const EventRowCalendarEvent: React.FC<EventRowCalendarEventProps> = ({
  event,
  authorFullName,
  labelIdentifierValue,
}: EventRowCalendarEventProps) => {
  const [, eventAction] = event.name.split('.');
  const [isOpen, setIsOpen] = useState(false);

  const renderRow = () => {
    switch (eventAction) {
      case 'linked': {
        return (
          <StyledItemAction>
            linked a calendar event with {labelIdentifierValue}
          </StyledItemAction>
        );
      }
      default:
        throw new Error('Invalid event action for calendarEvent event type.');
    }
  };
  return (
    <StyledEventRowCalendarEventContainer>
      <StyledRowContainer>
        <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
        {renderRow()}
        <EventCardToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
      </StyledRowContainer>
      <EventCard isOpen={isOpen}>
        <EventCardCalendarEvent calendarEventId={event.linkedRecordId} />
      </EventCard>
    </StyledEventRowCalendarEventContainer>
  );
};
