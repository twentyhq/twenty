import { HOST_NATIVE_ONLY_EVENT_PROPS } from '@/host/constants/HostNativeOnlyEventProps';

type HostNativeEventType =
  (typeof HOST_NATIVE_ONLY_EVENT_PROPS)[keyof typeof HOST_NATIVE_ONLY_EVENT_PROPS];

export const createNativeEventListenerRef = (handlersRef: {
  current: Partial<Record<HostNativeEventType, (event: Event) => void>>;
}) => {
  let attachedNode: Element | null = null;

  const listenersByEventType = Object.values(HOST_NATIVE_ONLY_EVENT_PROPS).map(
    (eventType) => ({
      eventType,
      listener: (event: Event) => {
        handlersRef.current[eventType]?.(event);
      },
    }),
  );

  return (node: Element | null) => {
    if (attachedNode !== null) {
      for (const { eventType, listener } of listenersByEventType) {
        attachedNode.removeEventListener(eventType, listener);
      }
      attachedNode = null;
    }

    if (node !== null) {
      for (const { eventType, listener } of listenersByEventType) {
        node.addEventListener(eventType, listener);
      }
      attachedNode = node;
    }
  };
};
