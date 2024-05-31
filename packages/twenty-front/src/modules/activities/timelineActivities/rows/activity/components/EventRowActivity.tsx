import styled from '@emotion/styled';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import {
  EventRowDynamicComponentProps,
  StyledItemAction,
  StyledItemAuthorText,
} from '@/activities/timelineActivities/rows/components/EventRowDynamicComponent';

type EventRowActivityProps = EventRowDynamicComponentProps;

const StyledLinkedActivity = styled.span`
  cursor: pointer;
  text-decoration: underline;
`;

export const EventRowActivity: React.FC<EventRowActivityProps> = ({
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
      <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
      <StyledItemAction>{eventAction}</StyledItemAction>
      <StyledLinkedActivity
        onClick={() => openActivityRightDrawer(event.linkedRecordId)}
      >
        {event.linkedRecordCachedName}
      </StyledLinkedActivity>
    </>
  );
};
