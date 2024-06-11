import { useState } from 'react';
import styled from '@emotion/styled';

import {
  EventCard,
  EventCardToggleButton,
} from '@/activities/timelineActivities/rows/components/EventCard';
import {
  EventRowDynamicComponentProps,
  StyledItemAction,
  StyledItemAuthorText,
  StyledItemLabelIdentifier,
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

export const EventRowMessage: React.FC<EventRowMessageProps> = ({
  labelIdentifierValue,
  event,
  authorFullName,
}: EventRowMessageProps) => {
  const [, eventAction] = event.name.split('.');
  const [isOpen, setIsOpen] = useState(false);

  const renderRow = () => {
    switch (eventAction) {
      case 'linked': {
        return (
          <>
            <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
            <StyledItemAction>linked an email with</StyledItemAction>
            <StyledItemLabelIdentifier>
              {labelIdentifierValue}
            </StyledItemLabelIdentifier>
          </>
        );
      }
      default:
        throw new Error('Invalid event action for message event type.');
    }
  };

  return (
    <StyledEventRowMessageContainer>
      <StyledRowContainer>
        {renderRow()}
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
