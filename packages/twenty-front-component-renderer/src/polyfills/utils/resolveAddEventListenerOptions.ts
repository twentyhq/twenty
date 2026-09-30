import { isObject } from '@sniptt/guards';

export const resolveAddEventListenerOptions = (
  options?: AddEventListenerOptions | boolean | null,
): AddEventListenerOptions =>
  isObject(options) ? options : { capture: options === true };
