const IME_PROCESS_KEY_CODE = 229;

const COMPOSING_ENTER_KEYBOARD_EVENT_INIT: KeyboardEventInit = {
  bubbles: true,
  key: 'Enter',
  code: 'Enter',
  keyCode: IME_PROCESS_KEY_CODE,
  which: IME_PROCESS_KEY_CODE,
  isComposing: true,
};

export const dispatchComposingEnterKeyPress = (input: HTMLElement): void => {
  input.dispatchEvent(
    new KeyboardEvent('keydown', {
      ...COMPOSING_ENTER_KEYBOARD_EVENT_INIT,
      cancelable: true,
    }),
  );
  input.dispatchEvent(
    new KeyboardEvent('keyup', COMPOSING_ENTER_KEYBOARD_EVENT_INIT),
  );
};
