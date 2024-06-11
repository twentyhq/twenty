import { useState } from 'react';
import styled from '@emotion/styled';

import {
  EventCard,
  EventCardToggleButton,
} from '@/activities/timelineActivities/rows/components/EventCard';
import {
  StyledItemAction,
  StyledItemAuthorText,
} from '@/activities/timelineActivities/rows/components/EventRowDynamicComponent';
import { EventFieldDiff } from '@/activities/timelineActivities/rows/mainObject/components/EventFieldDiff';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
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

const renderUpdateDescription = (
  mainObjectMetadataItem: ObjectMetadataItem,
  diffKey: string,
  diffValue: any,
  eventId: string,
  fieldMetadataItemMap: Record<string, FieldMetadataItem>,
) => {
  const fieldMetadataItem = fieldMetadataItemMap[diffKey];

  if (!fieldMetadataItem) {
    throw new Error(
      `Cannot find field metadata item for field name ${diffKey} on object ${mainObjectMetadataItem.nameSingular}`,
    );
  }

  const forgedRecordId = eventId + '--' + fieldMetadataItem.id;

  return (
    <EventFieldDiff
      key={forgedRecordId}
      diffRecord={diffValue}
      fieldMetadataItem={fieldMetadataItem}
      mainObjectMetadataItem={mainObjectMetadataItem}
      forgedRecordId={forgedRecordId}
    />
  );
};

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
        <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
        <StyledItemAction>
          updated
          {diffEntries.length === 1 &&
            renderUpdateDescription(
              mainObjectMetadataItem,
              diffEntries[0][0],
              diffEntries[0][1].after,
              event.id,
              fieldMetadataItemMap,
            )}
          {diffEntries.length > 1 && (
            <>
              <span>
                {diffEntries.length} fields on {labelIdentifierValue}
              </span>
              <EventCardToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
            </>
          )}
        </StyledItemAction>
      </StyledRowContainer>
      {diffEntries.length > 1 && (
        <EventCard isOpen={isOpen}>
          {diffEntries.map(([diffKey, diffValue]) =>
            renderUpdateDescription(
              mainObjectMetadataItem,
              diffKey,
              diffValue.after,
              event.id,
              fieldMetadataItemMap,
            ),
          )}
        </EventCard>
      )}
    </StyledEventRowMainObjectUpdatedContainer>
  );
};
