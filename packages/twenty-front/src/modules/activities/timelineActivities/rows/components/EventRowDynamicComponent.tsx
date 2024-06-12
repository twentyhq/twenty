import styled from '@emotion/styled';
import { IconCirclePlus, IconEditCircle, useIcons } from 'twenty-ui';

import { EventRowActivity } from '@/activities/timelineActivities/rows/activity/components/EventRowActivity';
import { EventRowCalendarEvent } from '@/activities/timelineActivities/rows/calendar/components/EventRowCalendarEvent';
import { EventRowMainObject } from '@/activities/timelineActivities/rows/mainObject/components/EventRowMainObject';
import { EventRowMessage } from '@/activities/timelineActivities/rows/message/components/EventRowMessage';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from '~/utils/isDefined';

export interface EventRowDynamicComponentProps {
  labelIdentifierValue: string;
  event: TimelineActivity;
  mainObjectMetadataItem: ObjectMetadataItem;
  linkedObjectMetadataItem: ObjectMetadataItem | null;
  authorFullName: string;
}

const StyledItemColumn = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledItemAuthorText = styled(StyledItemColumn)``;

export const StyledItemLabelIdentifier = styled(StyledItemColumn)``;

export const StyledItemAction = styled(StyledItemColumn)`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const eventRowComponentMap: {
  [key: string]: React.FC<EventRowDynamicComponentProps>;
} = {
  calendarEvent: EventRowCalendarEvent,
  message: EventRowMessage,
  task: EventRowActivity,
  note: EventRowActivity,
};

export const EventRowDynamicComponent = ({
  labelIdentifierValue,
  event,
  mainObjectMetadataItem,
  linkedObjectMetadataItem,
  authorFullName,
}: EventRowDynamicComponentProps) => {
  const [eventName] = event.name.split('.');
  const EventRowComponent = eventRowComponentMap[eventName];

  if (isDefined(EventRowComponent)) {
    return (
      <EventRowComponent
        labelIdentifierValue={labelIdentifierValue}
        event={event}
        mainObjectMetadataItem={mainObjectMetadataItem}
        linkedObjectMetadataItem={linkedObjectMetadataItem}
        authorFullName={authorFullName}
      />
    );
  }

  if (eventName === mainObjectMetadataItem?.nameSingular) {
    return (
      <EventRowMainObject
        labelIdentifierValue={labelIdentifierValue}
        event={event}
        mainObjectMetadataItem={mainObjectMetadataItem}
        linkedObjectMetadataItem={linkedObjectMetadataItem}
        authorFullName={authorFullName}
      />
    );
  }

  throw new Error(`Cannot find event component for event name ${eventName}`);
};

export const EventIconDynamicComponent = ({
  event,
  linkedObjectMetadataItem,
}: {
  event: TimelineActivity;
  linkedObjectMetadataItem: ObjectMetadataItem | null;
}) => {
  const { getIcon } = useIcons();
  const [, eventAction] = event.name.split('.');

  if (eventAction === 'created') {
    return <IconCirclePlus />;
  }
  if (eventAction === 'updated') {
    return <IconEditCircle />;
  }

  const IconComponent = getIcon(linkedObjectMetadataItem?.icon);

  return <IconComponent />;
};
