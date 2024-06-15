import { useState } from 'react';
import styled from '@emotion/styled';

import { EventCard } from '@/activities/timelineActivities/rows/components/EventCard';
import { EventCardToggleButton } from '@/activities/timelineActivities/rows/components/EventCardToggleButton';
import {
  EventRowDynamicComponentProps,
  StyledEventRowItemAction,
  StyledEventRowItemColumn,
} from '@/activities/timelineActivities/rows/components/EventRowDynamicComponent';
import { EventCardMessage } from '@/activities/timelineActivities/rows/message/components/EventCardMessage';

type EventRowMessageProps = EventRowDynamicComponentProps;

const StyledEventRowMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const EventRowMessage = ({
  event,
  authorFullName,
  labelIdentifierValue,
}: EventRowMessageProps) => {
  const [, eventAction] = event.name.split('.');
  const [isOpen, setIsOpen] = useState(false);

  if (['linked'].includes(eventAction) === false) {
    throw new Error('Invalid event action for message event type.');
  }

  return (
    <StyledEventRowMessageContainer>
      <StyledRowContainer>
        <StyledEventRowItemColumn>{authorFullName}</StyledEventRowItemColumn>
        <StyledEventRowItemAction>
          linked an email with
        </StyledEventRowItemAction>
        <StyledEventRowItemColumn>
          {labelIdentifierValue}
        </StyledEventRowItemColumn>
        <EventCardToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
      </StyledRowContainer>
      <EventCard isOpen={isOpen}>
        <EventCardMessage
          messageId={event.linkedRecordId}
          authorFullName={authorFullName}
        />
      </EventCard>
    </StyledEventRowMessageContainer>
  );
};
