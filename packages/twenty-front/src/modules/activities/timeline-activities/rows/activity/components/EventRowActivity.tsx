import styled from '@emotion/styled';

import {
  EventRowDynamicComponentProps,
  StyledEventRowItemAction,
  StyledEventRowItemColumn,
} from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';
import { isTimeLineActivityWithRecord } from '@/activities/timeline-activities/types/TimelineActivity';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { isNonEmptyString } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

type EventRowActivityProps = EventRowDynamicComponentProps;

const StyledLinkedActivity = styled.span`
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

export const StyledEventRowItemText = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

export const EventRowActivity = ({
  event,
  authorFullName,
  objectNameSingular,
  createdAt,
}: EventRowActivityProps & { objectNameSingular: CoreObjectNameSingular }) => {
  const [eventLinkedObject, eventAction] = event.name.split('.');

  const eventObject = eventLinkedObject.replace('linked-', '');

  if (!event.linkedRecordId) {
    throw new Error('Could not find linked record id for event');
  }

  const getActivityFromCache = useGetRecordFromCache({
    objectNameSingular,
    recordGqlFields: {
      id: true,
      title: true,
    },
  });

  const activityInStore = getActivityFromCache(event.linkedRecordId);

  const activityTitle = isNonEmptyString(activityInStore?.title)
    ? activityInStore?.title
    : isNonEmptyString(event.linkedRecordCachedName)
      ? event.linkedRecordCachedName
      : 'Untitled';

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  return (
    <StyledEventRow>
      <StyledRowContainer>
        <StyledRow>
          <StyledEventRowItemColumn>{authorFullName}</StyledEventRowItemColumn>
          <StyledEventRowItemAction>
            {`${eventAction} a related ${eventObject}`}
          </StyledEventRowItemAction>
          <StyledLinkedActivity
            onClick={() => {
              if (!isTimeLineActivityWithRecord(event)) {
                return;
              }

              openRecordInCommandMenu({
                recordId: event.linkedRecordId,
                objectNameSingular,
              });
            }}
          >
            <OverflowingTextWithTooltip text={activityTitle} />
          </StyledLinkedActivity>
        </StyledRow>
        <StyledItemTitleDate>{createdAt}</StyledItemTitleDate>
      </StyledRowContainer>
    </StyledEventRow>
  );
};
