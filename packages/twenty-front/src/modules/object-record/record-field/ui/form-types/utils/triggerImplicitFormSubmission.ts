import { isDefined } from 'twenty-shared/utils';

// Mirrors the browser's implicit submission for elements that don't get it
// natively (contenteditable): click the form's default button unless disabled.
export const triggerImplicitFormSubmission = (element: Element) => {
  const form = element.closest('form');

  if (!isDefined(form)) {
    return;
  }

  const defaultButton = Array.from(form.elements).find(
    (formElement): formElement is HTMLButtonElement | HTMLInputElement =>
      (formElement instanceof HTMLButtonElement ||
        formElement instanceof HTMLInputElement) &&
      formElement.type === 'submit',
  );

  if (!isDefined(defaultButton) || defaultButton.disabled) {
    return;
  }

  defaultButton.click();
};
