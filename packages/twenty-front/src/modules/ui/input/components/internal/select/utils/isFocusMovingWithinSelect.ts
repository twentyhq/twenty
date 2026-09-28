import { type FocusEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const isFocusMovingWithinSelect = ({
  event,
  dropdownContent,
}: {
  event: FocusEvent<HTMLElement>;
  dropdownContent: HTMLElement | null;
}) => {
  const nextFocus = event.relatedTarget;

  return (
    nextFocus instanceof Node &&
    (event.currentTarget.contains(nextFocus) ||
      (isDefined(dropdownContent) && dropdownContent.contains(nextFocus)))
  );
};
