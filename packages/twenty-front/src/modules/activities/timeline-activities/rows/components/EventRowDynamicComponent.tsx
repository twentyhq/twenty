import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventCard } from '@/activities/timeline-activities/rows/components/EventCard';
import { EventCardToggleButton } from '@/activities/timeline-activities/rows/components/EventCardToggleButton';
import { EventRowGenericLinked } from '@/activities/timeline-activities/rows/generic/components/EventRowGenericLinked';
import { EventRowMainObject } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObject';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FrontComponentRenderer } from '@/front-components/components/FrontComponentRenderer';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledNativeRowContainer = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledNativeRow = styled.div`
  min-width: 0;
  width: 100%;
`;

export const EventRowDynamicComponent = ({
  labelIdentifierValue,
  event,
  eventAction,
  eventTypeLabel,
  frontComponentId,
  mainObjectMetadataItem,
  linkedObjectMetadataItem,
  authorFullName,
  happensAt,
}: EventRowDynamicComponentProps) => {
  const [isFrontComponentOpen, setIsFrontComponentOpen] = useState(false);
  const EventRowComponent = isDefined(event.linkedRecordId)
    ? EventRowGenericLinked
    : EventRowMainObject;

  const nativeRenderer = (
    <EventRowComponent
      labelIdentifierValue={labelIdentifierValue}
      event={event}
      eventAction={eventAction}
      eventTypeLabel={eventTypeLabel}
      frontComponentId={frontComponentId}
      mainObjectMetadataItem={mainObjectMetadataItem}
      linkedObjectMetadataItem={linkedObjectMetadataItem}
      authorFullName={authorFullName}
      happensAt={happensAt}
    />
  );

  if (!isDefined(frontComponentId)) {
    return nativeRenderer;
  }

  return (
    <StyledContainer>
      <StyledNativeRowContainer>
        <StyledNativeRow>{nativeRenderer}</StyledNativeRow>
        <EventCardToggleButton
          isOpen={isFrontComponentOpen}
          setIsOpen={setIsFrontComponentOpen}
        />
      </StyledNativeRowContainer>
      {isFrontComponentOpen && (
        <EventCard isOpen>
          <FrontComponentRenderer
            frontComponentId={frontComponentId}
            timelineActivityId={event.id}
          />
        </EventCard>
      )}
    </StyledContainer>
  );
};
