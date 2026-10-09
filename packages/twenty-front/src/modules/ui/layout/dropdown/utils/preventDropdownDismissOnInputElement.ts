import { type DropdownDismissEvent } from 'twenty-ui/components/navigation';

export const preventDropdownDismissOnInputElement = (
  event: DropdownDismissEvent,
) => {
  if (event.target instanceof HTMLInputElement) {
    event.preventDefault();
  }
};
