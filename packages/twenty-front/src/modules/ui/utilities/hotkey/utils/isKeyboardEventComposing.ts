export const isKeyboardEventComposing = (keyboardEvent: KeyboardEvent) =>
  keyboardEvent.isComposing || keyboardEvent.keyCode === 229;
