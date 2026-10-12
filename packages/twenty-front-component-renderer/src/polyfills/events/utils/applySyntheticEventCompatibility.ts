type EventWithCancellationFlags = {
  defaultPrevented: boolean;
  cancelBubble: boolean;
};

type SyntheticEventCompatibility<TEvent extends EventWithCancellationFlags> = {
  nativeEvent: TEvent;
  isDefaultPrevented: () => boolean;
  isPropagationStopped: () => boolean;
  persist: () => void;
};

export const applySyntheticEventCompatibility = <
  TEvent extends EventWithCancellationFlags,
>(
  event: TEvent,
): TEvent & SyntheticEventCompatibility<TEvent> =>
  Object.assign(event, {
    nativeEvent: event,
    isDefaultPrevented: () => event.defaultPrevented,
    isPropagationStopped: () => event.cancelBubble,
    persist: () => undefined,
  });
