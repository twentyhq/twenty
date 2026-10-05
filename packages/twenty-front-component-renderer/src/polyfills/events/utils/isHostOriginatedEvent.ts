import { HOST_ORIGINATED_EVENTS } from '@/polyfills/events/constants/HostOriginatedEvents';

export const isHostOriginatedEvent = (event: object): boolean =>
  HOST_ORIGINATED_EVENTS.has(event);
