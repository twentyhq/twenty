import { HOST_ORIGINATED_EVENT_MARKER } from '@/polyfills/events/constants/HostOriginatedEventMarker';

export const isHostOriginatedEvent = (event: object): boolean =>
  HOST_ORIGINATED_EVENT_MARKER in event;
