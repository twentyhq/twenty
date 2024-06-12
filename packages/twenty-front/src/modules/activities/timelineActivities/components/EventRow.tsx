import { useContext } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useLinkedObject } from '@/activities/timeline/hooks/useLinkedObject';
import { TimelineActivityContext } from '@/activities/timelineActivities/contexts/TimelineActivityContext';
import { EventIconDynamicComponent } from '@/activities/timelineActivities/rows/components/EventIconDynamicComponent';
import { EventRowDynamicComponent } from '@/activities/timelineActivities/rows/components/EventRowDynamicComponent';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { getTimelineActivityAuthorFullName } from '@/activities/timelineActivities/utils/getTimelineActivityAuthorFullName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  height: 16px;
  width: 16px;
  margin: 5px;
  user-select: none;
  text-decoration-line: underline;
  z-index: 2;
  align-self: normal;
`;

const StyledItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
  overflow: hidden;
`;

const StyledItemTitleDate = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  margin-left: auto;
`;

const StyledVerticalLineContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  width: 26px;
  z-index: 2;
`;

const StyledVerticalLine = styled.div`
  align-self: stretch;
  background: ${({ theme }) => theme.border.color.light};
  flex-shrink: 0;
  width: 2px;
`;

const StyledTimelineItemContainer = styled.div<{ isGap?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  height: ${({ isGap, theme }) =>
    isGap ? (useIsMobile() ? theme.spacing(6) : theme.spacing(3)) : 'auto'};
  overflow: hidden;
  white-space: nowrap;
`;

const StyledSummary = styled.summary`
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  align-items: center;
  overflow: hidden;
`;

type EventRowProps = {
  mainObjectMetadataItem: ObjectMetadataItem | null;
  isLastEvent?: boolean;
  event: TimelineActivity;
};

export const EventRow = ({
  isLastEvent,
  event,
  mainObjectMetadataItem,
}: EventRowProps) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { labelIdentifierValue } = useContext(TimelineActivityContext);
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(event.createdAt);
  const linkedObjectMetadataItem = useLinkedObject(
    event.linkedObjectMetadataId,
  );

  if (isUndefinedOrNull(currentWorkspaceMember)) {
    return null;
  }

  const authorFullName = getTimelineActivityAuthorFullName(
    event,
    currentWorkspaceMember,
  );

  if (isUndefinedOrNull(mainObjectMetadataItem)) {
    throw new Error('mainObjectMetadataItem is required');
  }

  return (
    <>
      <StyledTimelineItemContainer>
        <StyledIconContainer>
          <EventIconDynamicComponent
            event={event}
            linkedObjectMetadataItem={linkedObjectMetadataItem}
          />
        </StyledIconContainer>
        <StyledItemContainer>
          <StyledSummary>
            <EventRowDynamicComponent
              authorFullName={authorFullName}
              labelIdentifierValue={labelIdentifierValue}
              event={event}
              mainObjectMetadataItem={mainObjectMetadataItem}
              linkedObjectMetadataItem={linkedObjectMetadataItem}
            />
          </StyledSummary>
          <StyledItemTitleDate id={`id-${event.id}`}>
            {beautifiedCreatedAt}
          </StyledItemTitleDate>
        </StyledItemContainer>
      </StyledTimelineItemContainer>
      {!isLastEvent && (
        <StyledTimelineItemContainer isGap>
          <StyledVerticalLineContainer>
            <StyledVerticalLine />
          </StyledVerticalLineContainer>
        </StyledTimelineItemContainer>
      )}
    </>
  );
};
