import { resolveOwnerWindowOfNode } from '@/polyfills/dom/utils/resolveOwnerWindowOfNode';

export const dispatchAsCurrentWindowEvent = ({
  eventTarget,
  event,
}: {
  eventTarget: Element;
  event: Event;
}): void => {
  const ownerWindow = resolveOwnerWindowOfNode(eventTarget);
  const previousWindowEvent = Reflect.get(ownerWindow, 'event');

  Reflect.set(ownerWindow, 'event', event);

  try {
    eventTarget.dispatchEvent(event);
  } finally {
    Reflect.set(ownerWindow, 'event', previousWindowEvent);
  }
};
