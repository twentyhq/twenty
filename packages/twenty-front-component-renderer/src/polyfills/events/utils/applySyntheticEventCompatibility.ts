type CancelableEvent = {
  defaultPrevented: boolean;
  cancelBubble: boolean;
};

type SyntheticEventCompatibility<TEvent extends CancelableEvent> = {
  nativeEvent: TEvent;
  isDefaultPrevented: () => boolean;
  isPropagationStopped: () => boolean;
  persist: () => void;
};

export const applySyntheticEventCompatibility = <
  TEvent extends CancelableEvent,
>(
  event: TEvent,
): TEvent & SyntheticEventCompatibility<TEvent> =>
  Object.assign(event, {
    nativeEvent: event,
    isDefaultPrevented: () => event.defaultPrevented,
    isPropagationStopped: () => event.cancelBubble,
    persist: () => undefined,
  });
