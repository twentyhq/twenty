import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { EventCard } from '@/activities/timeline-activities/rows/components/EventCard';
import { EventCardToggleButton } from '@/activities/timeline-activities/rows/components/EventCardToggleButton';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import { EventFieldDiffContainer } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffContainer';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  MOBILE_VIEWPORT,
  themeCssVariables,
} from 'twenty-ui-deprecated/theme-constants';

type EventRowMainObjectUpdatedProps = {
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  authorFullName: string;
  labelIdentifierValue: string;
  event: TimelineActivity;
  createdAt?: string;
};

const StyledRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

const StyledItemTitleDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${themeCssVariables.font.color.tertiary};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
`;

const StyledEventRowMainObjectUpdatedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const EventRowMainObjectUpdated = ({
  authorFullName,
  labelIdentifierValue,
  event,
  mainObjectMetadataItem,
  createdAt,
}: EventRowMainObjectUpdatedProps) => {
  const { t } = useLingui();
  const diff: Record<string, { before: any; after: any }> =
    event.properties?.diff;

  const [isOpen, setIsOpen] = useState(true);

  const diffEntries = Object.entries(diff);
  if (diffEntries.length === 0) {
    throw new Error('Cannot render update description without changes');
  }

  const fieldCount = diffEntries.length;
  const recordLabel = labelIdentifierValue;

  return (
    <StyledEventRowMainObjectUpdatedContainer>
      <StyledRowContainer>
        <StyledRow>
          <EventRowItem>{authorFullName}</EventRowItem>
          {t`updated`}
          {diffEntries.length === 1 && (
            <EventFieldDiffContainer
              mainObjectMetadataItem={mainObjectMetadataItem}
              diffKey={diffEntries[0][0]}
              fieldDiff={diffEntries[0][1]}
              eventId={event.id}
            />
          )}
          {diffEntries.length > 1 && (
            <>
              <span>{t`${fieldCount} fields on ${recordLabel}`}</span>
              <EventCardToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
            </>
          )}
        </StyledRow>
        <StyledItemTitleDate>{createdAt}</StyledItemTitleDate>
      </StyledRowContainer>
      {diffEntries.length > 1 && (
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
    </StyledEventRowMainObjectUpdatedContainer>
  );
};
