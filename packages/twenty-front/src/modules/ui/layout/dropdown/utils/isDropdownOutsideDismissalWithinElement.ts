import { isDefined } from 'twenty-shared/utils';
import { type DropdownOpenChangeDetails } from 'twenty-ui/components';

export const isDropdownOutsideDismissalWithinElement = ({
  eventDetails,
  element,
}: {
  eventDetails: DropdownOpenChangeDetails;
  element: Element | null;
}) => {
  if (!isDefined(element)) {
    return false;
  }

  if (eventDetails.reason === 'outside-press') {
    const pressedTarget = eventDetails.event.target;

    return pressedTarget instanceof Node && element.contains(pressedTarget);
  }

  if (
    eventDetails.reason === 'focus-out' &&
    eventDetails.event instanceof FocusEvent
  ) {
    const focusedTarget = eventDetails.event.relatedTarget;

    return focusedTarget instanceof Node && element.contains(focusedTarget);
  }

  return false;
};
