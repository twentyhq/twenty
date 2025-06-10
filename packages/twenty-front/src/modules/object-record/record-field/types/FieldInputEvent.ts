export type FieldInputEvent = (persist: () => void) => void;

export type FieldInputClickOutsideEvent = (
  persist: () => void,
  event: MouseEvent | TouchEvent,
) => void;
