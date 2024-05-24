import {
  EventDescriptionCommonProps,
  StyledItemAction,
  StyledItemAuthorText,
  StyledItemLabelIdentifier,
} from '@/activities/timelineActivities/components/descriptions/types/EventDescriptionCommon';

type EventMessageDescriptionProps = EventDescriptionCommonProps;

export const EventMessageDescription: React.FC<
  EventMessageDescriptionProps
> = ({
  labelIdentifierValue,
  event,
  authorFullName,
}: EventMessageDescriptionProps) => {
  const [, eventAction] = event.name.split('.');

  switch (eventAction) {
    case 'sent': {
      return (
        <>
          <StyledItemLabelIdentifier>
            {labelIdentifierValue}
          </StyledItemLabelIdentifier>
          <StyledItemAction>received an email from</StyledItemAction>
          <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
        </>
      );
    }
    case 'received': {
      return (
        <>
          <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
          <StyledItemAction>sent an email to</StyledItemAction>
          <StyledItemLabelIdentifier>
            {labelIdentifierValue}
          </StyledItemLabelIdentifier>
        </>
      );
    }
  }
};
