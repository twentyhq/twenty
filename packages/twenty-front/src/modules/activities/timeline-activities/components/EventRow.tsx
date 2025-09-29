import styled from '@emotion/styled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';

import { useLinkedObjectObjectMetadataItem } from '@/activities/timeline-activities/hooks/useLinkedObjectObjectMetadataItem';
import { EventIconDynamicComponent } from '@/activities/timeline-activities/rows/components/EventIconDynamicComponent';
import { EventRowDynamicComponent } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { getTimelineActivityAuthorFullName } from '@/activities/timeline-activities/utils/getTimelineActivityAuthorFullName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledTimelineItemContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  height: 'auto';
  justify-content: space-between;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

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
`;

const StyledVerticalLineContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  z-index: 2;
  height: 100%;
`;

const StyledVerticalLine = styled.div`
  background: ${({ theme }) => theme.border.color.light};
  width: 2px;
  height: 100%;
`;

const StyledSummary = styled.summary`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledItemContainer = styled.div<{ isMarginBottom?: boolean }>`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
  margin-bottom: ${({ isMarginBottom, theme }) =>
    isMarginBottom ? theme.spacing(3) : 0};
  min-height: 26px;
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
  const { localeCatalog } = useRecoilValue(dateLocaleState);

  const { recordId } = useContext(TimelineActivityContext);

  const recordFromStore = useRecoilValue(recordStoreFamilyState(recordId));

  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(
    event.createdAt,
    localeCatalog,
  );
  const linkedObjectMetadataItem = useLinkedObjectObjectMetadataItem(
    event.linkedObjectMetadataId,
  );

  if (isUndefinedOrNull(currentWorkspaceMember)) {
    return null;
  }

  if (isUndefinedOrNull(recordFromStore)) {
    return null;
  }
  if (isUndefinedOrNull(mainObjectMetadataItem)) {
    return null;
  }

  const labelIdentifier = getObjectRecordIdentifier({
    objectMetadataItem: mainObjectMetadataItem,
    record: recordFromStore,
  });

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
        <StyledLeftContainer>
          <StyledIconContainer>
            <EventIconDynamicComponent
              event={event}
              linkedObjectMetadataItem={linkedObjectMetadataItem}
            />
          </StyledIconContainer>
          {!isLastEvent && (
            <StyledVerticalLineContainer>
              <StyledVerticalLine />
            </StyledVerticalLineContainer>
          )}
        </StyledLeftContainer>
        <StyledItemContainer isMarginBottom={!isLastEvent}>
          <StyledSummary>
            <EventRowDynamicComponent
              authorFullName={authorFullName}
              labelIdentifierValue={labelIdentifier.name}
              event={event}
              mainObjectMetadataItem={mainObjectMetadataItem}
              linkedObjectMetadataItem={linkedObjectMetadataItem}
              createdAt={beautifiedCreatedAt}
            />
          </StyledSummary>
        </StyledItemContainer>
      </StyledTimelineItemContainer>
    </>
  );
};
