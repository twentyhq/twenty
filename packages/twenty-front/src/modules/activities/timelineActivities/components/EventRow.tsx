import { useContext } from 'react';
import styled from '@emotion/styled';
import {
  IconCirclePlus,
  IconEditCircle,
  IconFocusCentered,
  useIcons,
} from 'twenty-ui';

import { useLinkedObject } from '@/activities/timeline/hooks/useLinkedObject';
import { EventDescription } from '@/activities/timelineActivities/components/descriptions/components/EventDescription';
import { eventDescriptionComponentMap } from '@/activities/timelineActivities/components/descriptions/types/EventDescriptionCommon';
import { TimelineActivityContext } from '@/activities/timelineActivities/contexts/TimelineActivityContext';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { isDefined } from '~/utils/isDefined';
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
  const { getIcon } = useIcons();

  const { labelIdentifierValue } = useContext(TimelineActivityContext);
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(event.createdAt);
  const linkedObjectMetadataItem = useLinkedObject(
    event.linkedObjectMetadataId,
  );
  const authorFullName = event.workspaceMember
    ? `${event.workspaceMember?.name.firstName} ${event.workspaceMember?.name.lastName}`
    : 'Twenty';

  const [eventName, eventAction] = event.name.split('.');

  if (isUndefinedOrNull(mainObjectMetadataItem)) {
    return null;
  }

  const getEventIcon = () => {
    if (isDefined(linkedObjectMetadataItem?.id)) {
      return getIcon(linkedObjectMetadataItem?.icon);
    }

    if (eventAction === 'created') return IconCirclePlus;
    if (eventAction === 'updated') return IconEditCircle;

    return IconFocusCentered;
  };

  const EventIcon = getEventIcon();

  const getEventDescriptionComponent = () => {
    if (
      isDefined(eventName) &&
      isDefined(eventDescriptionComponentMap[eventName])
    ) {
      return eventDescriptionComponentMap[eventName];
    }

    if (eventName === mainObjectMetadataItem?.nameSingular) {
      return EventDescription;
    }

    return null;
  };

  const EventDescriptionComponent = getEventDescriptionComponent();

  return (
    <>
      <StyledTimelineItemContainer>
        <StyledIconContainer>
          <EventIcon />
        </StyledIconContainer>
        <StyledItemContainer>
          <StyledSummary>
            {EventDescriptionComponent && (
              <EventDescriptionComponent
                authorFullName={authorFullName}
                labelIdentifierValue={labelIdentifierValue}
                event={event}
                mainObjectMetadataItem={mainObjectMetadataItem}
                linkedObjectMetadataItem={linkedObjectMetadataItem}
              />
            )}
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
