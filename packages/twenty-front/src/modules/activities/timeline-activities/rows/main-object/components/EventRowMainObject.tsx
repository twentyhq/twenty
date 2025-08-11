import {
  type EventRowDynamicComponentProps,
  StyledEventRowItemAction,
  StyledEventRowItemColumn,
} from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';
import { EventRowMainObjectUpdated } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObjectUpdated';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

type EventRowMainObjectProps = EventRowDynamicComponentProps;

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
`;

const StyledItemTitleDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
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
              <StyledEventRowItemColumn>
                {labelIdentifierValue}
              </StyledEventRowItemColumn>
              <StyledEventRowItemAction>
                {t`was created by`}
              </StyledEventRowItemAction>
              <StyledEventRowItemColumn>
                {authorFullName}
              </StyledEventRowItemColumn>
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
              <StyledEventRowItemColumn>
                {labelIdentifierValue}
              </StyledEventRowItemColumn>
              <StyledEventRowItemAction>
                {t`was deleted by`}
              </StyledEventRowItemAction>
              <StyledEventRowItemColumn>
                {authorFullName}
              </StyledEventRowItemColumn>
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
              <StyledEventRowItemColumn>
                {labelIdentifierValue}
              </StyledEventRowItemColumn>
              <StyledEventRowItemAction>
                {t`was restored by`}
              </StyledEventRowItemAction>
              <StyledEventRowItemColumn>
                {authorFullName}
              </StyledEventRowItemColumn>
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
