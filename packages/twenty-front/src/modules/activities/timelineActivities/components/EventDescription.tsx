import styled from '@emotion/styled';
import { IconChevronDown, useIcons } from 'twenty-ui';

import { EventCalendarEventDescription } from '@/activities/timelineActivities/components/EventCalendarEventDescription';
import { EventMessageDescription } from '@/activities/timelineActivities/components/EventMessageDescription';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { IconButton } from '@/ui/input/button/components/IconButton';

type EventDescriptionProps = {
  event: TimelineActivity;
  mainObjectMetadataItem: ObjectMetadataItem | null;
  linkedObjectMetadata: ObjectMetadataItem | null;
};

const StyledMainObjectIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 14px;
  width: 14px;
`;

const StyledDescriptionContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledButtonContainer = styled.div`
  border-radius: 4px;
`;

const renderUpdatedDescription = (
  diff: Record<string, { before: any; after: any }>,
  mainObjectMetadataItem: any,
  getIcon: (iconName: string) => React.ComponentType,
) => {
  const diffKeys = Object.keys(diff);

  if (diffKeys.length === 0) {
    return `updated this ${mainObjectMetadataItem?.labelSingular?.toLowerCase()}`;
  }

  if (diffKeys.length === 1) {
    const key = diffKeys[0];
    const field = mainObjectMetadataItem?.fields.find(
      (field: any) => field.name === key,
    );

    const IconComponent = getIcon(field?.icon);

    return (
      <>
        <span>updated</span>
        <StyledMainObjectIconContainer>
          <IconComponent />
        </StyledMainObjectIconContainer>
        <span>{field?.label}</span>
      </>
    );
  }

  if (diffKeys.length > 1) {
    return `updated ${diffKeys.length} fields`;
  }
};

export const EventDescription = ({
  event,
  mainObjectMetadataItem,
  linkedObjectMetadata,
}: EventDescriptionProps) => {
  const diff: Record<string, { before: any; after: any }> =
    event.properties?.diff;
  const { getIcon } = useIcons();

  const [eventName, eventAction] = event.name.split('.');

  const openDiff = () => {
    console.log('openDiff');
  };

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
      return (
        <StyledDescriptionContainer>
          {renderUpdatedDescription(diff, mainObjectMetadataItem, getIcon)}
          <StyledButtonContainer>
            <IconButton
              Icon={IconChevronDown}
              onClick={() => openDiff()}
              size="small"
              variant="secondary"
            />
          </StyledButtonContainer>
        </StyledDescriptionContainer>
      );
    }
    default:
      return null;
  }
};
