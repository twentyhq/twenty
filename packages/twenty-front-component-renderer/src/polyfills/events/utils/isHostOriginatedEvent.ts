import { hostOriginatedEvents } from '@/polyfills/events/states/hostOriginatedEvents';

export const isHostOriginatedEvent = (event: object): boolean =>
  hostOriginatedEvents.has(event);
