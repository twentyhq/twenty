import { EventRowDate } from '@/activities/timeline-activities/rows/components/EventRowDate';
import { type EventRowNativeComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import {
  StyledEventRow,
  StyledEventRowContainer,
  StyledEventRowContent,
} from '@/activities/timeline-activities/rows/components/EventRowStyles';
import { EventRowMainObjectUpdated } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObjectUpdated';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

type EventRowMainObjectProps = EventRowNativeComponentProps;

export const EventRowMainObject = ({
  authorFullName,
  labelIdentifierValue,
  event,
  eventAction,
  eventTypeLabel,
  mainObjectMetadataItem,
  happensAt,
  hasRenderer,
}: EventRowMainObjectProps) => {
  switch (eventAction) {
    case 'created': {
      return (
        <StyledEventRow>
          <StyledEventRowContainer>
            <StyledEventRowContent>
              <EventRowItem>{labelIdentifierValue}</EventRowItem>
              <EventRowItem variant="action">
                {eventTypeLabel ?? t`was created by`}
              </EventRowItem>
              <EventRowItem>{authorFullName}</EventRowItem>
            </StyledEventRowContent>
            <EventRowDate happensAt={happensAt} />
          </StyledEventRowContainer>
        </StyledEventRow>
      );
    }
    case 'updated': {
      return (
        <EventRowMainObjectUpdated
          authorFullName={authorFullName}
          labelIdentifierValue={labelIdentifierValue}
          event={event}
          eventTypeLabel={eventTypeLabel}
          mainObjectMetadataItem={mainObjectMetadataItem}
          happensAt={happensAt}
          hasRenderer={hasRenderer}
        />
      );
    }
    case 'deleted': {
      return (
        <StyledEventRow>
          <StyledEventRowContainer>
            <StyledEventRowContent>
              <EventRowItem>{labelIdentifierValue}</EventRowItem>
              <EventRowItem variant="action">
                {eventTypeLabel ?? t`was deleted by`}
              </EventRowItem>
              <EventRowItem>{authorFullName}</EventRowItem>
            </StyledEventRowContent>
            <EventRowDate happensAt={happensAt} />
          </StyledEventRowContainer>
        </StyledEventRow>
      );
    }
    case 'restored': {
      return (
        <StyledEventRow>
          <StyledEventRowContainer>
            <StyledEventRowContent>
              <EventRowItem>{labelIdentifierValue}</EventRowItem>
              <EventRowItem variant="action">
                {eventTypeLabel ?? t`was restored by`}
              </EventRowItem>
              <EventRowItem>{authorFullName}</EventRowItem>
            </StyledEventRowContent>
            <EventRowDate happensAt={happensAt} />
          </StyledEventRowContainer>
        </StyledEventRow>
      );
    }
    default: {
      if (!isDefined(eventTypeLabel)) {
        return null;
      }

      return (
        <StyledEventRow>
          <StyledEventRowContainer>
            <StyledEventRowContent>
              <EventRowItem>{authorFullName}</EventRowItem>
              <EventRowItem variant="action">{eventTypeLabel}</EventRowItem>
              <EventRowItem>{labelIdentifierValue}</EventRowItem>
            </StyledEventRowContent>
            <EventRowDate happensAt={happensAt} />
          </StyledEventRowContainer>
        </StyledEventRow>
      );
    }
  }
};
