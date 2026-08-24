import { EventRowDate } from '@/activities/timeline-activities/rows/components/EventRowDate';
import { type EventRowNativeComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import { EventRowMainObjectUpdated } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObjectUpdated';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventRowMainObjectProps = EventRowNativeComponentProps;

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
`;

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
        <StyledMainContainer>
          <StyledRowContainer>
            <StyledRow>
              <EventRowItem>{labelIdentifierValue}</EventRowItem>
              <EventRowItem variant="action">
                {eventTypeLabel ?? t`was created by`}
              </EventRowItem>
              <EventRowItem>{authorFullName}</EventRowItem>
            </StyledRow>
            <EventRowDate happensAt={happensAt} />
          </StyledRowContainer>
        </StyledMainContainer>
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
        <StyledMainContainer>
          <StyledRowContainer>
            <StyledRow>
              <EventRowItem>{labelIdentifierValue}</EventRowItem>
              <EventRowItem variant="action">
                {eventTypeLabel ?? t`was deleted by`}
              </EventRowItem>
              <EventRowItem>{authorFullName}</EventRowItem>
            </StyledRow>
            <EventRowDate happensAt={happensAt} />
          </StyledRowContainer>
        </StyledMainContainer>
      );
    }
    case 'restored': {
      return (
        <StyledMainContainer>
          <StyledRowContainer>
            <StyledRow>
              <EventRowItem>{labelIdentifierValue}</EventRowItem>
              <EventRowItem variant="action">
                {eventTypeLabel ?? t`was restored by`}
              </EventRowItem>
              <EventRowItem>{authorFullName}</EventRowItem>
            </StyledRow>
            <EventRowDate happensAt={happensAt} />
          </StyledRowContainer>
        </StyledMainContainer>
      );
    }
    default: {
      if (!isDefined(eventTypeLabel)) {
        return null;
      }

      return (
        <StyledMainContainer>
          <StyledRowContainer>
            <StyledRow>
              <EventRowItem>{authorFullName}</EventRowItem>
              <EventRowItem variant="action">{eventTypeLabel}</EventRowItem>
              <EventRowItem>{labelIdentifierValue}</EventRowItem>
            </StyledRow>
            <EventRowDate happensAt={happensAt} />
          </StyledRowContainer>
        </StyledMainContainer>
      );
    }
  }
};
