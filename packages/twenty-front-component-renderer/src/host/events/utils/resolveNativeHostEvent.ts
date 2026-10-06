import { isObject } from '@sniptt/guards';

export const resolveNativeHostEvent = (hostEvent: object): object =>
  'nativeEvent' in hostEvent && isObject(hostEvent.nativeEvent)
    ? hostEvent.nativeEvent
    : hostEvent;
