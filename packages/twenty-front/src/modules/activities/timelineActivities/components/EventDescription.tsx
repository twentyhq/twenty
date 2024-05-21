import styled from '@emotion/styled';
import { useIcons } from 'twenty-ui';

import { EventCalendarEventDescription } from '@/activities/timelineActivities/components/EventCalendarEventDescription';
import { EventMessageDescription } from '@/activities/timelineActivities/components/EventMessageDescription';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type EventDescriptionProps = {
  event: TimelineActivity;
  mainObjectMetadataItem: ObjectMetadataItem | null;
  linkedObjectMetadata: ObjectMetadataItem | null;
};

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 14px;
  width: 14px;
`;

const StyledDescriptionContainer = styled.div`
  align-items: center;
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const EventDescription = ({
  event,
  mainObjectMetadataItem,
  linkedObjectMetadata,
}: EventDescriptionProps) => {
  const diff: Record<string, { before: any; after: any }> =
    event.properties?.diff;
  const { getIcon } = useIcons();

  const [eventName, eventAction] = event.name.split('.');

  if (eventName === 'calendarEvent') {
    return (
      <EventCalendarEventDescription
        eventAction={eventAction}
        mainObjectMetadataItem={mainObjectMetadataItem}
        calendarEventObjectMetadataItem={linkedObjectMetadata}
      />
    );
  }
  if (eventName === 'message') {
    return (
      <EventMessageDescription
        eventAction={eventAction}
        mainObjectMetadataItem={mainObjectMetadataItem}
        messageObjectMetadataItem={linkedObjectMetadata}
      />
    );
  }

  switch (eventAction) {
    case 'created': {
      return `created this ${mainObjectMetadataItem?.labelSingular?.toLowerCase()}`;
    }
    case 'updated': {
      const diffKeys = Object.keys(diff);

      if (diffKeys.length === 0) {
        return `updated this ${mainObjectMetadataItem?.labelSingular?.toLowerCase()}`;
      }

      if (diffKeys.length === 1) {
        const key = Object.keys(diff)[0];
        const field = mainObjectMetadataItem?.fields.find(
          (field) => field.name === key,
        );
        const IconComponent = getIcon(field?.icon);

        return (
          <StyledDescriptionContainer>
            <StyledIconContainer>
              <IconComponent />
            </StyledIconContainer>
            <span>{field?.label}</span>
          </StyledDescriptionContainer>
        );
      }

      if (diffKeys.length > 1) {
        return `updated ${diffKeys.length} fields`;
      }
    }
  }
};
