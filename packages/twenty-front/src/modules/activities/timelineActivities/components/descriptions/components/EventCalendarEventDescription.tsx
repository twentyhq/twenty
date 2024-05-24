import {
  EventDescriptionCommonProps,
  StyledItemAction,
  StyledItemAuthorText,
} from '@/activities/timelineActivities/components/descriptions/types/EventDescriptionCommon';

type EventCalendarEventDescriptionProps = EventDescriptionCommonProps;

export const EventCalendarEventDescription: React.FC<
  EventCalendarEventDescriptionProps
> = ({ event, authorFullName }: EventCalendarEventDescriptionProps) => {
  const [, eventAction] = event.name.split('.');

  switch (eventAction) {
    case 'sent': {
      return (
        <>
          <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
          <StyledItemAction>has been invited to an event</StyledItemAction>
        </>
      );
    }
    case 'received': {
      return (
        <>
          <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
          <StyledItemAction>created an event</StyledItemAction>
        </>
      );
    }
  }
};
