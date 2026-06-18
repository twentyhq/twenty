import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { EventCardCalendarEvent } from '@/activities/timeline-activities/rows/calendar/components/EventCardCalendarEvent';
import { EventCard } from '@/activities/timeline-activities/rows/components/EventCard';
import { EventCardToggleButton } from '@/activities/timeline-activities/rows/components/EventCardToggleButton';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import { isTimelineActivityWithLinkedRecord } from '@/activities/timeline-activities/types/TimelineActivity';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventRowCalendarEventProps = EventRowDynamicComponentProps;

const StyledEventRowCalendarEventContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
`;

export const EventRowCalendarEvent = ({
  event,
  authorFullName,
  labelIdentifierValue,
}: EventRowCalendarEventProps) => {
  const { t } = useLingui();
  const [, eventAction] = event.name.split('.');
  const [isOpen, setIsOpen] = useState(false);

  if (['linked'].includes(eventAction) === false) {
    throw new Error('Invalid event action for calendarEvent event type.');
  }

  return (
    <StyledEventRowCalendarEventContainer>
      <StyledRowContainer>
        <EventRowItem>{authorFullName}</EventRowItem>
        <EventRowItem variant="action">
          {t`linked a calendar event with ${labelIdentifierValue}`}
        </EventRowItem>
        <EventCardToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
      </StyledRowContainer>
      {isTimelineActivityWithLinkedRecord(event) && (
        <EventCard isOpen={isOpen}>
          <EventCardCalendarEvent calendarEventId={event.linkedRecordId} />
        </EventCard>
      )}
    </StyledEventRowCalendarEventContainer>
  );
};
