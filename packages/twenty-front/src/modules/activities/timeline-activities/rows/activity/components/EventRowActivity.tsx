import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { EventRowDate } from '@/activities/timeline-activities/rows/components/EventRowDate';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import {
  StyledEventRowContainer,
  StyledEventRowContent,
  StyledEventRowLinkedRecord,
} from '@/activities/timeline-activities/rows/components/EventRowStyles';
import { isTimelineActivityWithLinkedRecord } from '@/activities/timeline-activities/types/TimelineActivity';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventRowActivityProps = EventRowDynamicComponentProps;

const getEventActionSentence = (
  eventAction: TimelineActivityAction | null,
  objectNameSingular: string,
): string => {
  switch (eventAction) {
    case 'created':
      return t`created a related ${objectNameSingular}`;
    case 'updated':
      return t`updated a related ${objectNameSingular}`;
    case 'deleted':
      return t`deleted a related ${objectNameSingular}`;
    case 'restored':
      return t`restored a related ${objectNameSingular}`;
    case 'unlinked':
      return t`unlinked a related ${objectNameSingular}`;
    default:
      return t`linked a related ${objectNameSingular}`;
  }
};

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
  eventAction,
  authorFullName,
  linkedObjectMetadataItem,
  createdAt,
}: EventRowActivityProps) => {
  if (!isTimelineActivityWithLinkedRecord(event)) {
    throw new Error('Could not find linked record id for event');
  }

  if (!isDefined(linkedObjectMetadataItem)) {
    throw new Error('Could not find linked object metadata for event');
  }

  const { nameSingular: objectNameSingular } = linkedObjectMetadataItem;

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
            {getEventActionSentence(eventAction, objectNameSingular)}
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
        <EventRowDate createdAt={createdAt} />
      </StyledEventRowContainer>
    </StyledEventRow>
  );
};
