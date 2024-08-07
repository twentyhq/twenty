import styled from '@emotion/styled';

import { EventRowActivity } from '@/activities/timelineActivities/rows/activity/components/EventRowActivity';
import { EventRowCalendarEvent } from '@/activities/timelineActivities/rows/calendar/components/EventRowCalendarEvent';
import { EventRowMainObject } from '@/activities/timelineActivities/rows/main-object/components/EventRowMainObject';
import { EventRowMessage } from '@/activities/timelineActivities/rows/message/components/EventRowMessage';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export interface EventRowDynamicComponentProps {
  labelIdentifierValue: string;
  event: TimelineActivity;
  mainObjectMetadataItem: ObjectMetadataItem;
  linkedObjectMetadataItem: ObjectMetadataItem | null;
  authorFullName: string;
}

export const StyledEventRowItemColumn = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledEventRowItemAction = styled(StyledEventRowItemColumn)`
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const EventRowDynamicComponent = ({
  labelIdentifierValue,
  event,
  mainObjectMetadataItem,
  linkedObjectMetadataItem,
  authorFullName,
}: EventRowDynamicComponentProps) => {
  const [eventName] = event.name.split('.');

  switch (eventName) {
    case 'calendarEvent':
      return (
        <EventRowCalendarEvent
          labelIdentifierValue={labelIdentifierValue}
          event={event}
          mainObjectMetadataItem={mainObjectMetadataItem}
          linkedObjectMetadataItem={linkedObjectMetadataItem}
          authorFullName={authorFullName}
        />
      );
    case 'message':
      return (
        <EventRowMessage
          labelIdentifierValue={labelIdentifierValue}
          event={event}
          mainObjectMetadataItem={mainObjectMetadataItem}
          linkedObjectMetadataItem={linkedObjectMetadataItem}
          authorFullName={authorFullName}
        />
      );
    case 'linked-task':
      return (
        <EventRowActivity
          labelIdentifierValue={labelIdentifierValue}
          event={event}
          mainObjectMetadataItem={mainObjectMetadataItem}
          linkedObjectMetadataItem={linkedObjectMetadataItem}
          authorFullName={authorFullName}
          objectNameSingular={CoreObjectNameSingular.Task}
        />
      );
    case 'linked-note':
      return (
        <EventRowActivity
          labelIdentifierValue={labelIdentifierValue}
          event={event}
          mainObjectMetadataItem={mainObjectMetadataItem}
          linkedObjectMetadataItem={linkedObjectMetadataItem}
          authorFullName={authorFullName}
          objectNameSingular={CoreObjectNameSingular.Note}
        />
      );
    case mainObjectMetadataItem?.nameSingular:
      return (
        <EventRowMainObject
          labelIdentifierValue={labelIdentifierValue}
          event={event}
          mainObjectMetadataItem={mainObjectMetadataItem}
          linkedObjectMetadataItem={linkedObjectMetadataItem}
          authorFullName={authorFullName}
        />
      );
    default:
      throw new Error(
        `Cannot find event component for event name ${eventName}`,
      );
  }
};
