import { t } from '@lingui/core/macro';
import { type KeyboardEvent } from 'react';

import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import {
  StyledEventRowContainer,
  StyledEventRowContent,
  StyledEventRowDate,
  StyledEventRowLinkedRecord,
} from '@/activities/timeline-activities/rows/components/EventRowStyles';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';

type EventRowGenericLinkedProps = EventRowDynamicComponentProps;

export const EventRowGenericLinked = ({
  event,
  authorFullName,
  linkedObjectMetadataItem,
  createdAt,
}: EventRowGenericLinkedProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const objectLabel =
    linkedObjectMetadataItem?.labelSingular?.toLowerCase() ?? t`record`;

  const linkedRecordName = isNonEmptyString(event.linkedRecordCachedName)
    ? event.linkedRecordCachedName
    : t`Untitled`;

  const canOpen =
    isDefined(event.linkedRecordId) &&
    isDefined(linkedObjectMetadataItem?.nameSingular);

  const handleOpen = () => {
    if (!canOpen) {
      return;
    }

    openRecordInSidePanel({
      recordId: event.linkedRecordId as string,
      objectNameSingular: linkedObjectMetadataItem?.nameSingular as string,
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
          {t`linked a ${objectLabel}`}
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
      <StyledEventRowDate>{createdAt}</StyledEventRowDate>
    </StyledEventRowContainer>
  );
};
