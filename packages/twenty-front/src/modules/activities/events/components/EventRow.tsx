import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';
import { IconCirclePlus, IconEditCircle, IconFocusCentered } from 'twenty-ui';

import { EventUpdateProperty } from '@/activities/events/components/EventUpdateProperty';
import { Event } from '@/activities/events/types/Event';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

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

const StyledItemTitleContainer = styled.div`
  display: flex;
  flex: 1;
  flex-flow: row ${() => (useIsMobile() ? 'wrap' : 'nowrap')};
  gap: ${({ theme }) => theme.spacing(1)};
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

type EventRowProps = {
  targetableObject: ActivityTargetableObject;
  isLastEvent?: boolean;
  event: Event;
};

export const EventRow = ({
  isLastEvent,
  event,
  targetableObject,
}: EventRowProps) => {
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(event.createdAt);
  const exactCreatedAt = beautifyExactDateTime(event.createdAt);

  const properties = JSON.parse(event.properties);
  const diff: Record<string, { before: any; after: any }> = properties?.diff;

  const isEventType = (type: 'created' | 'updated') => {
    return (
      event.name === type + '.' + targetableObject.targetObjectNameSingular
    );
  };

  return (
    <>
      <StyledTimelineItemContainer>
        <StyledIconContainer>
          {isEventType('created') && <IconCirclePlus />}
          {isEventType('updated') && <IconEditCircle />}
          {!isEventType('created') && !isEventType('updated') && (
            <IconFocusCentered />
          )}
        </StyledIconContainer>
        <StyledItemContainer>
          <StyledItemTitleContainer>
            <StyledItemAuthorText>
              {event.workspaceMember?.name.firstName}{' '}
              {event.workspaceMember?.name.lastName}
            </StyledItemAuthorText>
            <StyledActionName>
              {isEventType('created') && 'created'}
              {isEventType('updated') && 'updated'}
              {!isEventType('created') && !isEventType('updated') && event.name}
            </StyledActionName>
            <StyledItemTitle>
              {isEventType('created') &&
                `a new ${targetableObject.targetObjectNameSingular}`}
              {isEventType('updated') &&
                Object.entries(diff).map(([key, value]) => (
                  <EventUpdateProperty
                    propertyName={key}
                    after={value?.after}
                  ></EventUpdateProperty>
                ))}
              {!isEventType('created') &&
                !isEventType('updated') &&
                JSON.stringify(diff)}
            </StyledItemTitle>
          </StyledItemTitleContainer>
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
