import { isFunction } from '@sniptt/guards';

import { REACT_UNSUPPORTED_EVENT_PROP_TO_EVENT_TYPE } from '@/host/constants/ReactUnsupportedEventPropToEventType';
import { type ReactUnsupportedEventHandlers } from '@/host/types/ReactUnsupportedEventHandlers';

const REACT_UNSUPPORTED_EVENT_PROP_ENTRIES = Object.entries(
  REACT_UNSUPPORTED_EVENT_PROP_TO_EVENT_TYPE,
);

export const extractReactUnsupportedEventHandlers = (
  hostReactProps: Record<string, unknown>,
): {
  reactUnsupportedEventHandlers: ReactUnsupportedEventHandlers;
  reactBindableProps: Record<string, unknown>;
} => {
  const reactUnsupportedEventHandlers: ReactUnsupportedEventHandlers = {};
  const reactBindableProps = { ...hostReactProps };

  for (const [
    reactPropName,
    reactUnsupportedEventType,
  ] of REACT_UNSUPPORTED_EVENT_PROP_ENTRIES) {
    const handler = reactBindableProps[reactPropName];
    delete reactBindableProps[reactPropName];

    if (isFunction(handler)) {
      reactUnsupportedEventHandlers[reactUnsupportedEventType] = handler as (
        event: Event,
      ) => void;
    }
  }

  return { reactUnsupportedEventHandlers, reactBindableProps };
};
