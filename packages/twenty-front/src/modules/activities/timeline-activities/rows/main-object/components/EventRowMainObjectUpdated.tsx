import styled from '@emotion/styled';
import { useState } from 'react';

import { EventCard } from '@/activities/timeline-activities/rows/components/EventCard';
import { EventCardToggleButton } from '@/activities/timeline-activities/rows/components/EventCardToggleButton';
import {
  StyledEventRowItemAction,
  StyledEventRowItemColumn,
} from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';
import { EventFieldDiffContainer } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffContainer';
import { TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type EventRowMainObjectUpdatedProps = {
  mainObjectMetadataItem: ObjectMetadataItem;
  authorFullName: string;
  labelIdentifierValue: string;
  event: TimelineActivity;
};

const StyledRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledEventRowMainObjectUpdatedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const EventRowMainObjectUpdated = ({
  authorFullName,
  labelIdentifierValue,
  event,
  mainObjectMetadataItem,
}: EventRowMainObjectUpdatedProps) => {
  const diff: Record<string, { before: any; after: any }> =
    event.properties?.diff;

  const [isOpen, setIsOpen] = useState(true);

  const fieldMetadataItemMap: Record<string, FieldMetadataItem> =
    mainObjectMetadataItem.fields.reduce(
      (acc, field) => ({ ...acc, [field.name]: field }),
      {},
    );

  const diffEntries = Object.entries(diff);
  if (diffEntries.length === 0) {
    throw new Error('Cannot render update description without changes');
  }

  return (
    <StyledEventRowMainObjectUpdatedContainer>
      <StyledRowContainer>
        <StyledEventRowItemColumn>{authorFullName}</StyledEventRowItemColumn>
        <StyledEventRowItemAction>
          updated
          {diffEntries.length === 1 && (
            <EventFieldDiffContainer
              mainObjectMetadataItem={mainObjectMetadataItem}
              diffKey={diffEntries[0][0]}
              diffValue={diffEntries[0][1].after}
              eventId={event.id}
              fieldMetadataItemMap={fieldMetadataItemMap}
            />
          )}
          {diffEntries.length > 1 && (
            <>
              <span>
                {diffEntries.length} fields on {labelIdentifierValue}
              </span>
              <EventCardToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
            </>
          )}
        </StyledEventRowItemAction>
      </StyledRowContainer>
      {diffEntries.length > 1 && (
        <EventCard isOpen={isOpen}>
          {diffEntries.map(([diffKey, diffValue]) => (
            <EventFieldDiffContainer
              key={diffKey}
              mainObjectMetadataItem={mainObjectMetadataItem}
              diffKey={diffKey}
              diffValue={diffValue.after}
              eventId={event.id}
              fieldMetadataItemMap={fieldMetadataItemMap}
            />
          ))}
        </EventCard>
      )}
    </StyledEventRowMainObjectUpdatedContainer>
  );
};
