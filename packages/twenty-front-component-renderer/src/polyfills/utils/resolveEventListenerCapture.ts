import { isObject } from '@sniptt/guards';

export const resolveEventListenerCapture = (
  options?: EventListenerOptions | boolean | null,
): boolean => (isObject(options) ? options.capture === true : options === true);
