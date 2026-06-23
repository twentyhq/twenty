import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import {
  StyledEventRowContainer,
  StyledEventRowContent,
  StyledEventRowDate,
  StyledEventRowLinkedRecord,
} from '@/activities/timeline-activities/rows/components/EventRowStyles';
import { isTimelineActivityWithLinkedRecord } from '@/activities/timeline-activities/types/TimelineActivity';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { parseTimelineActivityVerb } from 'twenty-shared/timeline';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { isNonEmptyString } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventRowActivityProps = EventRowDynamicComponentProps;

const StyledEventRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const StyledEventRowItemText = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

export const EventRowActivity = ({
  event,
  authorFullName,
  objectNameSingular,
  createdAt,
}: EventRowActivityProps & { objectNameSingular: CoreObjectNameSingular }) => {
  const eventAction = parseTimelineActivityVerb(event.name);

  const eventObject = objectNameSingular;

  if (!isTimelineActivityWithLinkedRecord(event)) {
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

  const computeActivityTitle = () => {
    if (isNonEmptyString(activityInStore?.title)) {
      return activityInStore?.title;
    }

    if (isNonEmptyString(event.linkedRecordCachedName)) {
      return event.linkedRecordCachedName;
    }

    return t`Untitled`;
  };
  const activityTitle = computeActivityTitle();

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  return (
    <StyledEventRow>
      <StyledEventRowContainer>
        <StyledEventRowContent>
          <EventRowItem>{authorFullName}</EventRowItem>
          <EventRowItem variant="action">
            {t`${eventAction} a related ${eventObject}`}
          </EventRowItem>
          <StyledEventRowLinkedRecord
            onClick={() =>
              openRecordInSidePanel({
                recordId: event.linkedRecordId,
                objectNameSingular,
              })
            }
          >
            <OverflowingTextWithTooltip text={activityTitle} />
          </StyledEventRowLinkedRecord>
        </StyledEventRowContent>
        <StyledEventRowDate>{createdAt}</StyledEventRowDate>
      </StyledEventRowContainer>
    </StyledEventRow>
  );
};
