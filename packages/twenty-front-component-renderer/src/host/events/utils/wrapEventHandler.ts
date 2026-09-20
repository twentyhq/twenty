import { matchesPreventDefaultRule } from '@/host/events/utils/matchesPreventDefaultRule';
import { serializeEvent } from '@/host/events/utils/serializeEvent';
import { type SerializedEventData } from '@/types/SerializedEventData';

type PreventableEvent = { preventDefault?: () => void };

// A front component's handler runs across the thread boundary and only ever
// sees serialized data, so a `preventDefault()` there reaches nothing: the host
// has already returned and the browser has run the default action. The host
// instead reads the element's `preventDefaultOn` rules synchronously here, while
// it still holds the real event, so the guest can suppress the default
// declaratively without touching the event itself.
export const wrapEventHandler =
  (
    handler: (detail: SerializedEventData) => void,
    preventDefaultRules?: readonly string[],
  ) =>
  (event: unknown): void => {
    const detail = serializeEvent(event);

    if (
      preventDefaultRules !== undefined &&
      preventDefaultRules.some((rule) =>
        matchesPreventDefaultRule(rule, detail),
      )
    ) {
      (event as PreventableEvent)?.preventDefault?.();
    }

    handler(detail);
  };
