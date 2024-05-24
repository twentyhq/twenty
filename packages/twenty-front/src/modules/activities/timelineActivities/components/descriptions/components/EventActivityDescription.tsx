import styled from '@emotion/styled';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import {
  EventDescriptionCommonProps,
  StyledItemAction,
  StyledItemAuthorText,
} from '@/activities/timelineActivities/components/descriptions/types/EventDescriptionCommon';

type EventActivityDescriptionProps = EventDescriptionCommonProps;

const StyledLinkedObject = styled.span`
  cursor: pointer;
  text-decoration: underline;
`;

export const EventActivityDescription: React.FC<
  EventActivityDescriptionProps
> = ({ event, authorFullName }: EventActivityDescriptionProps) => {
  const [, eventAction] = event.name.split('.');

  const openActivityRightDrawer = useOpenActivityRightDrawer();

  return (
    <>
      <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
      <StyledItemAction>{eventAction}</StyledItemAction>
      <StyledLinkedObject
        onClick={() => openActivityRightDrawer(event.linkedRecordId)}
      >
        {event.linkedRecordCachedName}
      </StyledLinkedObject>
    </>
  );
};
