import { isObject } from '@sniptt/guards';

export const isRequestObject = (input: RequestInfo | URL): input is Request =>
  isObject(input) && !(input instanceof URL);
