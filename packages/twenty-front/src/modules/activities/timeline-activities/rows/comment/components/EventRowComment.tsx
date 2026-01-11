import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import {
  type EventRowDynamicComponentProps,
  StyledEventRowItemAction,
  StyledEventRowItemColumn,
} from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';
import { isTimelineActivityWithLinkedRecord } from '@/activities/timeline-activities/types/TimelineActivity';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

type EventRowCommentProps = EventRowDynamicComponentProps;

const StyledLinkedComment = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  text-decoration: underline;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
`;

const StyledEventRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;

const StyledItemTitleDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

export const EventRowComment = ({
  event,
  authorFullName,
  createdAt,
}: EventRowCommentProps) => {
  const [eventLinkedObject, eventAction] = event.name.split('.');

  const eventObject = eventLinkedObject.replace('linked-', '');

  if (!isTimelineActivityWithLinkedRecord(event)) {
    throw new Error('Could not find linked record id for event');
  }

  const commentPreview = event.linkedRecordCachedName || t`Comment`;

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  return (
    <StyledEventRow>
      <StyledRowContainer>
        <StyledRow>
          <StyledEventRowItemColumn>{authorFullName}</StyledEventRowItemColumn>
          <StyledEventRowItemAction>
            {t`${eventAction} a ${eventObject}`}
          </StyledEventRowItemAction>
          <StyledLinkedComment
            onClick={() =>
              openRecordInCommandMenu({
                recordId: event.linkedRecordId,
                objectNameSingular: CoreObjectNameSingular.Comment,
              })
            }
          >
            <OverflowingTextWithTooltip text={commentPreview} />
          </StyledLinkedComment>
        </StyledRow>
        <StyledItemTitleDate>{createdAt}</StyledItemTitleDate>
      </StyledRowContainer>
    </StyledEventRow>
  );
};
