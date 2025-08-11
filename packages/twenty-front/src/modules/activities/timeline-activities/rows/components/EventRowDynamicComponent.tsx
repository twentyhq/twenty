import styled from '@emotion/styled';

import { EventRowActivity } from '@/activities/timeline-activities/rows/activity/components/EventRowActivity';
import { EventRowCalendarEvent } from '@/activities/timeline-activities/rows/calendar/components/EventRowCalendarEvent';
import { EventRowMainObject } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObject';
import { EventRowMessage } from '@/activities/timeline-activities/rows/message/components/EventRowMessage';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export interface EventRowDynamicComponentProps {
  labelIdentifierValue: string;
  event: TimelineActivity;
  mainObjectMetadataItem: ObjectMetadataItem;
  linkedObjectMetadataItem: ObjectMetadataItem | null;
  authorFullName: string;
  createdAt?: string;
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
  createdAt,
}: EventRowDynamicComponentProps) => {
  switch (linkedObjectMetadataItem?.nameSingular) {
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
    case 'task':
      return (
        <EventRowActivity
          labelIdentifierValue={labelIdentifierValue}
          event={event}
          mainObjectMetadataItem={mainObjectMetadataItem}
          linkedObjectMetadataItem={linkedObjectMetadataItem}
          authorFullName={authorFullName}
          objectNameSingular={CoreObjectNameSingular.Task}
          createdAt={createdAt}
        />
      );
    case 'note':
      return (
        <EventRowActivity
          labelIdentifierValue={labelIdentifierValue}
          event={event}
          mainObjectMetadataItem={mainObjectMetadataItem}
          linkedObjectMetadataItem={linkedObjectMetadataItem}
          authorFullName={authorFullName}
          objectNameSingular={CoreObjectNameSingular.Note}
          createdAt={createdAt}
        />
      );
    default:
      return (
        <EventRowMainObject
          labelIdentifierValue={labelIdentifierValue}
          event={event}
          mainObjectMetadataItem={mainObjectMetadataItem}
          linkedObjectMetadataItem={linkedObjectMetadataItem}
          authorFullName={authorFullName}
          createdAt={createdAt}
        />
      );
  }
};
