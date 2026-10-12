import { hostOriginatedEvents } from '@/polyfills/events/states/hostOriginatedEvents';

export const markEventAsHostOriginated = (event: object): void => {
  hostOriginatedEvents.add(event);
};
