import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';
import {
  IconCheckbox,
  IconCirclePlus,
  IconEditCircle,
  IconFocusCentered,
  IconNotes,
  useIcons,
} from 'twenty-ui';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { useLinkedObject } from '@/activities/timeline/hooks/useLinkedObject';
import { EventUpdateProperty } from '@/activities/timelineActivities/components/EventUpdateProperty';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

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

const StyledActionName = styled.span`
  overflow: hidden;
  flex: none;
  white-space: nowrap;
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
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(event.createdAt);
  const exactCreatedAt = beautifyExactDateTime(event.createdAt);

  const properties = JSON.parse(event.properties);
  const diff: Record<string, { before: any; after: any }> = properties?.diff;

  const isEventType = (type: 'created' | 'updated') => {
    if (event.name.includes('.')) {
      return event.name.split('.')[1] === type;
    }
    return false;
  };

  const { getIcon } = useIcons();

  const linkedObjectMetadata = useLinkedObject(event.linkedObjectMetadataId);

  const linkedObjectLabel = event.name.includes('note')
    ? 'note'
    : event.name.includes('task')
      ? 'task'
      : linkedObjectMetadata?.labelSingular;

  const ActivityIcon = event.linkedObjectMetadataId
    ? event.name.includes('note')
      ? IconNotes
      : event.name.includes('task')
        ? IconCheckbox
        : getIcon(linkedObjectMetadata?.icon)
    : isEventType('created')
      ? IconCirclePlus
      : isEventType('updated')
        ? IconEditCircle
        : IconFocusCentered;

  const author =
    event.workspaceMember?.name.firstName +
    ' ' +
    event.workspaceMember?.name.lastName;

  const action = isEventType('created')
    ? 'created'
    : isEventType('updated')
      ? 'updated'
      : event.name;

  let description;

  if (!isUndefinedOrNull(linkedObjectMetadata)) {
    description = 'a ' + linkedObjectLabel;
  } else if (!event.linkedObjectMetadataId && isEventType('created')) {
    description = `a new ${mainObjectMetadataItem?.labelSingular}`;
  } else if (isEventType('updated')) {
    const diffKeys = Object.keys(diff);
    if (diffKeys.length === 0) {
      description = `a ${mainObjectMetadataItem?.labelSingular}`;
    } else if (diffKeys.length === 1) {
      const [key, value] = Object.entries(diff)[0];
      description = [
        <EventUpdateProperty
          propertyName={key}
          after={value?.after as string}
        />,
      ];
    } else if (diffKeys.length === 2) {
      description =
        mainObjectMetadataItem?.fields.find(
          (field) => diffKeys[0] === field.name,
        )?.label +
        ' and ' +
        mainObjectMetadataItem?.fields.find(
          (field) => diffKeys[1] === field.name,
        )?.label;
    } else if (diffKeys.length > 2) {
      description =
        diffKeys[0] + ' and ' + (diffKeys.length - 1) + ' other fields';
    }
  } else if (!isEventType('created') && !isEventType('updated')) {
    description = JSON.stringify(diff);
  }
  const details = JSON.stringify(diff);

  const openActivityRightDrawer = useOpenActivityRightDrawer();

  return (
    <>
      <StyledTimelineItemContainer>
        <StyledIconContainer>
          <ActivityIcon />
        </StyledIconContainer>
        <StyledItemContainer>
          <details>
            <StyledSummary>
              <StyledItemAuthorText>{author}</StyledItemAuthorText>
              <StyledActionName>{action}</StyledActionName>
              <StyledItemTitle>{description}</StyledItemTitle>
              {isUndefinedOrNull(linkedObjectMetadata) ? (
                <></>
              ) : (
                <StyledLinkedObject
                  onClick={() => openActivityRightDrawer(event.linkedRecordId)}
                >
                  {event.linkedRecordCachedName}
                </StyledLinkedObject>
              )}
            </StyledSummary>
            {details}
          </details>

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
            <StyledVerticalLine></StyledVerticalLine>
          </StyledVerticalLineContainer>
        </StyledTimelineItemContainer>
      )}
    </>
  );
};
