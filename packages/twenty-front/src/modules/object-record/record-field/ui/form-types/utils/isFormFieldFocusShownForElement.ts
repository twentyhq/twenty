const isTextEntryElement = (element: Element) =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  (element instanceof HTMLElement && element.isContentEditable);

export const isFormFieldFocusShownForElement = ({
  element,
  shouldHighlightOnTriggerFocus,
}: {
  element: Element;
  shouldHighlightOnTriggerFocus: boolean;
}) => {
  if (element instanceof HTMLButtonElement) {
    return false;
  }

  if (isTextEntryElement(element)) {
    return true;
  }

  return shouldHighlightOnTriggerFocus && element.matches(':focus-visible');
};
