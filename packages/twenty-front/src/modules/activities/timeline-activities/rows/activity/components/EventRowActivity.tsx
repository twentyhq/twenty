import styled from '@emotion/styled';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import {
  EventRowDynamicComponentProps,
  StyledEventRowItemAction,
  StyledEventRowItemColumn,
} from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { isNonEmptyString } from '@sniptt/guards';

type EventRowActivityProps = EventRowDynamicComponentProps;

const StyledLinkedActivity = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  text-decoration: underline;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledEventRowItemText = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

export const EventRowActivity = ({
  event,
  authorFullName,
  objectNameSingular,
}: EventRowActivityProps & { objectNameSingular: CoreObjectNameSingular }) => {
  const [eventLinkedObject, eventAction] = event.name.split('.');

  const eventObject = eventLinkedObject.replace('linked-', '');

  if (!event.linkedRecordId) {
    throw new Error('Could not find linked record id for event');
  }

  const getActivityFromCache = useGetRecordFromCache({
    objectNameSingular,
    recordGqlFields: {
      id: true,
      title: true,
    },
  });

  const activityInStore = getActivityFromCache(event.linkedRecordId);

  const activityTitle = isNonEmptyString(activityInStore?.title)
    ? activityInStore?.title
    : isNonEmptyString(event.linkedRecordCachedName)
      ? event.linkedRecordCachedName
      : 'Untitled';

  const openActivityRightDrawer = useOpenActivityRightDrawer({
    objectNameSingular,
  });

  return (
    <>
      <StyledEventRowItemColumn>{authorFullName}</StyledEventRowItemColumn>
      <StyledEventRowItemAction>
        {`${eventAction} a related ${eventObject}`}
      </StyledEventRowItemAction>
      <StyledLinkedActivity
        onClick={() => openActivityRightDrawer(event.linkedRecordId)}
      >
        {activityTitle}
      </StyledLinkedActivity>
    </>
  );
};
