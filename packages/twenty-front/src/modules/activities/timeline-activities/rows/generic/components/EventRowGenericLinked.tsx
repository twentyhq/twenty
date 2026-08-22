import { t } from '@lingui/core/macro';
import { type KeyboardEvent } from 'react';

import { EventRowDate } from '@/activities/timeline-activities/rows/components/EventRowDate';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import {
  StyledEventRowContainer,
  StyledEventRowContent,
  StyledEventRowLinkedRecord,
} from '@/activities/timeline-activities/rows/components/EventRowStyles';
import { getTimelineActivityActionSentence } from '@/activities/timeline-activities/rows/utils/getTimelineActivityActionSentence';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';

type EventRowGenericLinkedProps = EventRowDynamicComponentProps;

export const EventRowGenericLinked = ({
  event,
  eventAction,
  timelineActivityTypeLabel,
  authorFullName,
  linkedObjectMetadataItem,
  createdAt,
}: EventRowGenericLinkedProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const objectNameSingular =
    linkedObjectMetadataItem?.labelSingular?.toLowerCase() ?? t`record`;

  const linkedRecordName = isNonEmptyString(event.linkedRecordCachedName)
    ? event.linkedRecordCachedName
    : t`Untitled`;

  const linkedRecordId = event.linkedRecordId;
  const linkedObjectNameSingular = linkedObjectMetadataItem?.nameSingular;
  const canOpen =
    isDefined(linkedRecordId) && isDefined(linkedObjectNameSingular);

  const handleOpen = () => {
    if (!isDefined(linkedRecordId) || !isDefined(linkedObjectNameSingular)) {
      return;
    }

    openRecordInSidePanel({
      recordId: linkedRecordId,
      objectNameSingular: linkedObjectNameSingular,
    });
  };

  const handleKeyDown = (keyboardEvent: KeyboardEvent<HTMLSpanElement>) => {
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      handleOpen();
    }
  };

  return (
    <StyledEventRowContainer>
      <StyledEventRowContent>
        <EventRowItem>{authorFullName}</EventRowItem>
        <EventRowItem variant="action">
          {getTimelineActivityActionSentence({
            eventAction,
            objectNameSingular,
            timelineActivityTypeLabel,
          })}
        </EventRowItem>
        <StyledEventRowLinkedRecord
          role={canOpen ? 'button' : undefined}
          tabIndex={canOpen ? 0 : undefined}
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
        >
          <OverflowingTextWithTooltip text={linkedRecordName} />
        </StyledEventRowLinkedRecord>
      </StyledEventRowContent>
      <EventRowDate createdAt={createdAt} />
    </StyledEventRowContainer>
  );
};
