import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';
import {
  IconCirclePlus,
  IconEditCircle,
  IconFocusCentered,
  useIcons,
} from 'twenty-ui';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { useLinkedObject } from '@/activities/timeline/hooks/useLinkedObject';
import { EventDescription } from '@/activities/timelineActivities/components/EventDescription';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';
import { isDefined } from '~/utils/isDefined';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  user-select: none;
  height: 16px;
  margin: 5px;
  justify-content: center;
  text-decoration-line: underline;
  width: 16px;
  z-index: 2;
`;

const StyledItemContainer = styled.div`
  align-content: center;
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  span {
    color: ${({ theme }) => theme.font.color.secondary};
  }
  overflow: hidden;
`;

const StyledItemAuthorText = styled.span`
  display: flex;
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(1)};
  white-space: nowrap;
`;

const StyledItemTitle = styled.span`
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledLinkedObject = styled.span`
  cursor: pointer;
  text-decoration: underline;
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

const StyledTooltip = styled(Tooltip)`
  background-color: ${({ theme }) => theme.background.primary};

  box-shadow: 0px 2px 4px 3px
    ${({ theme }) => theme.background.transparent.light};

  box-shadow: 2px 4px 16px 6px
    ${({ theme }) => theme.background.transparent.light};

  color: ${({ theme }) => theme.font.color.primary};

  opacity: 1;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTimelineItemContainer = styled.div<{ isGap?: boolean }>`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  height: ${({ isGap, theme }) =>
    isGap ? (useIsMobile() ? theme.spacing(6) : theme.spacing(3)) : 'auto'};
  overflow: hidden;
  white-space: nowrap;
`;

const StyledSummary = styled.summary`
  display: flex;
  flex: 1;
  flex-flow: row ${() => (useIsMobile() ? 'wrap' : 'nowrap')};
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;

type EventRowV2Props = {
  mainObjectMetadataItem: ObjectMetadataItem | null;
  isLastEvent?: boolean;
  event: TimelineActivity;
};

export const EventRowV2 = ({
  isLastEvent,
  event,
  mainObjectMetadataItem,
}: EventRowV2Props) => {
  const { getIcon } = useIcons();
  const openActivityRightDrawer = useOpenActivityRightDrawer();

  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(event.createdAt);
  const exactCreatedAt = beautifyExactDateTime(event.createdAt);
  const linkedObjectMetadata = useLinkedObject(event.linkedObjectMetadataId);
  const authorFullName = event.workspaceMember
    ? `${event.workspaceMember?.name.firstName} ${event.workspaceMember?.name.lastName}`
    : 'Twenty';

  const isEventType = (type: 'created' | 'updated') => {
    return event.name.split('.').includes(type);
  };

  const EventIcon = () => {
    if (isDefined(event.linkedObjectMetadataId)) {
      const IconComponent = getIcon(linkedObjectMetadata?.icon);

      return <IconComponent />;
    }

    if (isEventType('created')) return <IconCirclePlus />;
    if (isEventType('updated')) return <IconEditCircle />;

    return <IconFocusCentered />;
  };

  return (
    <>
      <StyledTimelineItemContainer>
        <StyledIconContainer>
          <EventIcon />
        </StyledIconContainer>
        <StyledItemContainer>
          <StyledSummary>
            <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
            <StyledItemTitle>
              <EventDescription
                event={event}
                mainObjectMetadataItem={mainObjectMetadataItem}
                linkedObjectMetadata={linkedObjectMetadata}
              />
            </StyledItemTitle>
            {linkedObjectMetadata && (
              <StyledLinkedObject
                onClick={() => openActivityRightDrawer(event.linkedRecordId)}
              >
                {event.linkedRecordCachedName}
              </StyledLinkedObject>
            )}
          </StyledSummary>
          <StyledItemTitleDate id={`id-${event.id}`}>
            {beautifiedCreatedAt}
          </StyledItemTitleDate>
          <StyledTooltip
            anchorSelect={`#id-${event.id}`}
            content={exactCreatedAt}
            clickable
            noArrow
          />
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
