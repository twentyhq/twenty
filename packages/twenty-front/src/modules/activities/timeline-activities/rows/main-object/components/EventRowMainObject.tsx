import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import { EventRowMainObjectUpdated } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObjectUpdated';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

type EventRowMainObjectProps = EventRowDynamicComponentProps;

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

export const EventRowMainObject = ({
  authorFullName,
  labelIdentifierValue,
  event,
  mainObjectMetadataItem,
  createdAt,
}: EventRowMainObjectProps) => {
  const [, eventAction] = event.name.split('.');

  switch (eventAction) {
    case 'created': {
      return (
        <StyledMainContainer>
          <StyledRowContainer>
            <StyledRow>
              <EventRowItem>{labelIdentifierValue}</EventRowItem>
              <EventRowItem variant="action">{t`was created by`}</EventRowItem>
              <EventRowItem>{authorFullName}</EventRowItem>
            </StyledRow>
            <StyledItemTitleDate>{createdAt}</StyledItemTitleDate>
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
          mainObjectMetadataItem={mainObjectMetadataItem}
          createdAt={createdAt}
        />
      );
    }
    case 'deleted': {
      return (
        <StyledMainContainer>
          <StyledRowContainer>
            <StyledRow>
              <EventRowItem>{labelIdentifierValue}</EventRowItem>
              <EventRowItem variant="action">{t`was deleted by`}</EventRowItem>
              <EventRowItem>{authorFullName}</EventRowItem>
            </StyledRow>
            <StyledItemTitleDate>{createdAt}</StyledItemTitleDate>
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
              <EventRowItem variant="action">{t`was restored by`}</EventRowItem>
              <EventRowItem>{authorFullName}</EventRowItem>
            </StyledRow>
            <StyledItemTitleDate>{createdAt}</StyledItemTitleDate>
          </StyledRowContainer>
        </StyledMainContainer>
      );
    }
    default:
      return null;
  }
};
