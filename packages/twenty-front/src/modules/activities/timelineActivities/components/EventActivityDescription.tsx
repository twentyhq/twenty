import styled from '@emotion/styled';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

const StyledLinkedObject = styled.span`
  cursor: pointer;
  text-decoration: underline;
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type EventActivityDescriptionProps = {
  event: TimelineActivity;
  mainObjectMetadataItem: ObjectMetadataItem | null;
  activityObjectMetadataItem: ObjectMetadataItem | null;
};

export const EventActivityDescription = ({
  event,
  mainObjectMetadataItem,
  activityObjectMetadataItem,
}: EventActivityDescriptionProps) => {
  const [, eventAction] = event.name.split('.');

  const openActivityRightDrawer = useOpenActivityRightDrawer();

  return (
    <StyledContainer>
      <span>{eventAction}</span>
      <StyledLinkedObject
        onClick={() => openActivityRightDrawer(event.linkedRecordId)}
      >
        {event.linkedRecordCachedName}
      </StyledLinkedObject>
    </StyledContainer>
  );
};
