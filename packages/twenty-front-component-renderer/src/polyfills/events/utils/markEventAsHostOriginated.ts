import { HOST_ORIGINATED_EVENTS } from '@/polyfills/events/constants/HostOriginatedEvents';

export const markEventAsHostOriginated = (event: object): void => {
  HOST_ORIGINATED_EVENTS.add(event);
};
