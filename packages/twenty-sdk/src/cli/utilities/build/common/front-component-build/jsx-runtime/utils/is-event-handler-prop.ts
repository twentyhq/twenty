import { type EventHandler } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler.type';

const EVENT_PROP_NAME_PATTERN = /^on[A-Z]/;

export const isEventHandlerProp = (
  propName: string,
  propValue: unknown,
): propValue is EventHandler =>
  EVENT_PROP_NAME_PATTERN.test(propName) && typeof propValue === 'function';
