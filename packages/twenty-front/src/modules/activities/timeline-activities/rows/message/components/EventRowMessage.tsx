import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { EventCard } from '@/activities/timeline-activities/rows/components/EventCard';
import { EventCardToggleButton } from '@/activities/timeline-activities/rows/components/EventCardToggleButton';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import { EventCardMessage } from '@/activities/timeline-activities/rows/message/components/EventCardMessage';
import { isTimelineActivityWithLinkedRecord } from '@/activities/timeline-activities/types/TimelineActivity';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventRowMessageProps = EventRowDynamicComponentProps;

const StyledEventRowMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
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
        <EventRowItem>{authorFullName}</EventRowItem>
        <EventRowItem variant="action">{t`linked an email with`}</EventRowItem>
        <EventRowItem>{labelIdentifierValue}</EventRowItem>
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
