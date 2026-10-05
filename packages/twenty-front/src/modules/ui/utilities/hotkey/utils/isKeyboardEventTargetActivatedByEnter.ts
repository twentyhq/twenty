const ENTER_ACTIVATED_TARGET_SELECTOR = [
  'button',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  'input[type="image"]',
  '[role="button"]',
  'a[href]',
  '[role="link"]',
].join(', ');

export const isKeyboardEventTargetActivatedByEnter = (
  keyboardEvent: KeyboardEvent,
) =>
  keyboardEvent.target instanceof Element &&
  keyboardEvent.target.matches(ENTER_ACTIVATED_TARGET_SELECTOR);
