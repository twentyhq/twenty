import { isFunction, isObject } from '@sniptt/guards';

export const isDispatchableEventTarget = (
  value: unknown,
): value is EventTarget =>
  isObject(value) &&
  'dispatchEvent' in value &&
  isFunction(value.dispatchEvent);
