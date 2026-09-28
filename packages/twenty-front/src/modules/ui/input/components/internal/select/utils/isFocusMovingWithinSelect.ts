import { type FocusEvent } from 'react';

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
      dropdownContent?.contains(nextFocus) === true)
  );
};
