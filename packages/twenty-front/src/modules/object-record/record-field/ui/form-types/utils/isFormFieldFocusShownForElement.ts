const isTextEntryElement = (element: Element) =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  (element instanceof HTMLElement && element.isContentEditable);

// Buttons inside a field keep their own focus ring; other triggers count only when the field opts in.
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
