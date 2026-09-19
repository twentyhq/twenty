import { matchesPreventDefaultRule } from '@/host/events/utils/matchesPreventDefaultRule';
import { serializeEvent } from '@/host/events/utils/serializeEvent';
import { type SerializedEventData } from '@/types/SerializedEventData';

type PreventableEvent = { preventDefault?: () => void };

/**
 * A front component's handler runs on the other side of the thread boundary, so
 * the event it receives is serialized data and not the event itself. Calling
 * `preventDefault()` there reaches nothing: by then the host has returned and
 * the browser has already run the default action.
 *
 * `preventDefaultOn` closes that gap declaratively. The rules travel with the
 * element, the host reads them synchronously while it still holds the real
 * event, and the guest keeps saying what it wants rather than how to get it.
 */
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
