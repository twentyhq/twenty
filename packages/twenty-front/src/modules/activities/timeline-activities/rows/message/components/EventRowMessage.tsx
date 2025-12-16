import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { EventCard } from '@/activities/timeline-activities/rows/components/EventCard';
import { EventCardToggleButton } from '@/activities/timeline-activities/rows/components/EventCardToggleButton';
import {
  type EventRowDynamicComponentProps,
  StyledEventRowItemAction,
  StyledEventRowItemColumn,
} from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';
import { EventCardMessage } from '@/activities/timeline-activities/rows/message/components/EventCardMessage';
import { isTimelineActivityWithLinkedRecord } from '@/activities/timeline-activities/types/TimelineActivity';

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
          {t`linked an email with`}
        </StyledEventRowItemAction>
        <StyledEventRowItemColumn>
          {labelIdentifierValue}
        </StyledEventRowItemColumn>
        <EventCardToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
      </StyledRowContainer>
      <EventCard isOpen={isOpen}>
        {isTimelineActivityWithLinkedRecord(event) && (
          <EventCardMessage
            messageId={event.linkedRecordId}
            authorFullName={authorFullName}
          />
        )}
      </EventCard>
    </StyledEventRowMessageContainer>
  );
};
