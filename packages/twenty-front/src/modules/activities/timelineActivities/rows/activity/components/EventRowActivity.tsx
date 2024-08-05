import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import {
  EventRowDynamicComponentProps,
  StyledEventRowItemAction,
  StyledEventRowItemColumn,
} from '@/activities/timelineActivities/rows/components/EventRowDynamicComponent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

type EventRowActivityProps = EventRowDynamicComponentProps;

const StyledLinkedActivity = styled.span`
  cursor: pointer;
  text-decoration: underline;
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

  const [activityInStore] = useRecoilState(
    recordStoreFamilyState(event.linkedRecordId),
  );

  const openActivityRightDrawer = useOpenActivityRightDrawer({
    objectNameSingular,
  });

  return (
    <>
      <StyledEventRowItemColumn>{authorFullName}</StyledEventRowItemColumn>
      <StyledEventRowItemAction>
        {`${eventAction} a related ${eventObject}`}
      </StyledEventRowItemAction>
      {activityInStore ? (
        <StyledLinkedActivity
          onClick={() => openActivityRightDrawer(event.linkedRecordId)}
        >
          {event.linkedRecordCachedName}
        </StyledLinkedActivity>
      ) : (
        <span>{event.linkedRecordCachedName}</span>
      )}
    </>
  );
};
