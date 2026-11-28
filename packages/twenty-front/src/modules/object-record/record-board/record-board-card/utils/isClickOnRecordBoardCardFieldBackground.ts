import { type MouseEvent } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

const FIELD_INTERACTIVE_ELEMENT_SELECTOR = doNotTranslate(
  '[data-inline-cell-display-mode], button, a, input, textarea, [role]',
);

export const isClickOnRecordBoardCardFieldBackground = (
  event: MouseEvent<HTMLElement>,
) => {
  const fieldContainer = event.currentTarget;
  const target = event.target;

  if (!(target instanceof Element) || !fieldContainer.contains(target)) {
    return false;
  }

  const selection = window.getSelection();

  if (isDefined(selection) && !selection.isCollapsed) {
    return false;
  }

  // The card's drag wrapper is itself role="button", so only matches inside the field count.
  const interactiveElement = target.closest(FIELD_INTERACTIVE_ELEMENT_SELECTOR);

  return (
    !isDefined(interactiveElement) ||
    !fieldContainer.contains(interactiveElement)
  );
};
