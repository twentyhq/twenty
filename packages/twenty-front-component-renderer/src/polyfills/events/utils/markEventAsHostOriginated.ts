import { HOST_ORIGINATED_EVENT_MARKER } from '@/polyfills/events/constants/HostOriginatedEventMarker';

export const markEventAsHostOriginated = (event: object): void => {
  Object.defineProperty(event, HOST_ORIGINATED_EVENT_MARKER, {
    value: true,
    configurable: true,
  });
};
