import styled from '@emotion/styled';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import {
  EventRowDynamicComponentProps,
  StyledEventRowItemAction,
  StyledEventRowItemColumn,
} from '@/activities/timelineActivities/rows/components/EventRowDynamicComponent';

type EventRowActivityProps = EventRowDynamicComponentProps;

const StyledLinkedActivity = styled.span`
  cursor: pointer;
  text-decoration: underline;
`;

export const EventRowActivity = ({
  event,
  authorFullName,
}: EventRowActivityProps) => {
  const [, eventAction] = event.name.split('.');

  const openActivityRightDrawer = useOpenActivityRightDrawer();

  if (!event.linkedRecordId) {
    throw new Error('Could not find linked record id for event');
  }

  return (
    <>
      <StyledEventRowItemColumn>{authorFullName}</StyledEventRowItemColumn>
      <StyledEventRowItemAction>{eventAction}</StyledEventRowItemAction>
      <StyledLinkedActivity
        onClick={() => openActivityRightDrawer(event.linkedRecordId)}
      >
        {event.linkedRecordCachedName}
      </StyledLinkedActivity>
    </>
  );
};
