import { isObject } from '@sniptt/guards';

export const isRequestObject = <TRequest extends object>(
  input: string | URL | TRequest,
): input is TRequest => isObject(input) && !(input instanceof URL);
