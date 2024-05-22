import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';
import {
  IconCirclePlus,
  IconEditCircle,
  IconFocusCentered,
  useIcons,
} from 'twenty-ui';

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

const StyledItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
  color: ${({ theme }) => theme.font.color.tertiary};
  overflow: hidden;

  span {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledItemAuthorText = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  white-space: nowrap;
`;

const StyledItemTitle = styled.span`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  white-space: nowrap;
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
  const { getIcon } = useIcons();

  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(event.createdAt);
  const exactCreatedAt = beautifyExactDateTime(event.createdAt);
  const linkedObjectMetadata = useLinkedObject(event.linkedObjectMetadataId);
  const authorFullName = event.workspaceMember
    ? `${event.workspaceMember?.name.firstName} ${event.workspaceMember?.name.lastName}`
    : 'Twenty';

  const [, eventAction] = event.name.split('.');

  const EventIcon = () => {
    if (isDefined(event.linkedObjectMetadataId)) {
      const IconComponent = getIcon(linkedObjectMetadata?.icon);

      return <IconComponent />;
    }

    if (eventAction === 'created') return <IconCirclePlus />;
    if (eventAction === 'updated') return <IconEditCircle />;

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
