import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { EventCard } from '@/activities/timeline-activities/rows/components/EventCard';
import { EventCardToggleButton } from '@/activities/timeline-activities/rows/components/EventCardToggleButton';
import { EventRowDate } from '@/activities/timeline-activities/rows/components/EventRowDate';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import {
  StyledEventRow,
  StyledEventRowContainer,
  StyledEventRowContent,
} from '@/activities/timeline-activities/rows/components/EventRowStyles';
import { EventFieldDiffContainer } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffContainer';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

type EventRowMainObjectUpdatedProps = {
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  authorFullName: string;
  labelIdentifierValue: string;
  eventTypeLabel?: string;
  event: Pick<TimelineActivity, 'id' | 'properties'>;
  happensAt?: string;
  hasRenderer?: boolean;
};

export const EventRowMainObjectUpdated = ({
  authorFullName,
  labelIdentifierValue,
  eventTypeLabel,
  event,
  mainObjectMetadataItem,
  happensAt,
  hasRenderer,
}: EventRowMainObjectUpdatedProps) => {
  const { t } = useLingui();
  const diff = event.properties.diff ?? {};

  const [isOpen, setIsOpen] = useState(true);

  const diffEntries = Object.entries(diff);
  if (diffEntries.length === 0) {
    return (
      <StyledEventRow>
        <StyledEventRowContainer>
          <StyledEventRowContent>
            <EventRowItem>{authorFullName}</EventRowItem>
            <EventRowItem variant="action">
              {eventTypeLabel ?? t`updated`}
            </EventRowItem>
            <EventRowItem>{labelIdentifierValue}</EventRowItem>
          </StyledEventRowContent>
          <EventRowDate happensAt={happensAt} />
        </StyledEventRowContainer>
      </StyledEventRow>
    );
  }

  const fieldCount = diffEntries.length;
  const [firstDiffEntry] = diffEntries;
  const recordLabel = labelIdentifierValue;

  return (
    <StyledEventRow>
      <StyledEventRowContainer>
        <StyledEventRowContent>
          <EventRowItem>{authorFullName}</EventRowItem>
          <EventRowItem variant="action">
            {eventTypeLabel ?? t`updated`}
          </EventRowItem>
          {fieldCount === 1 && isDefined(firstDiffEntry) && (
            <EventFieldDiffContainer
              mainObjectMetadataItem={mainObjectMetadataItem}
              diffKey={firstDiffEntry[0]}
              fieldDiff={firstDiffEntry[1]}
              eventId={event.id}
            />
          )}
          {diffEntries.length > 1 && (
            <>
              <span>{t`${fieldCount} fields on ${recordLabel}`}</span>
              {!hasRenderer && (
                <EventCardToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
              )}
            </>
          )}
        </StyledEventRowContent>
        <EventRowDate happensAt={happensAt} />
      </StyledEventRowContainer>
      {diffEntries.length > 1 && !hasRenderer && (
        <EventCard isOpen={isOpen}>
          {diffEntries.map(([diffKey, diffValue]) => (
            <EventFieldDiffContainer
              key={diffKey}
              mainObjectMetadataItem={mainObjectMetadataItem}
              diffKey={diffKey}
              fieldDiff={diffValue}
              eventId={event.id}
            />
          ))}
        </EventCard>
      )}
    </StyledEventRow>
  );
};
