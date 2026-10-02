const ENTER_ACTIVATED_TARGET_SELECTOR = [
  'button',
  '[role="button"]',
  'a[href]',
  '[role="link"]',
].join(', ');

export const isKeyboardEventTargetActivatedByEnter = (
  keyboardEvent: KeyboardEvent,
) =>
  keyboardEvent.target instanceof Element &&
  keyboardEvent.target.matches(ENTER_ACTIVATED_TARGET_SELECTOR);
