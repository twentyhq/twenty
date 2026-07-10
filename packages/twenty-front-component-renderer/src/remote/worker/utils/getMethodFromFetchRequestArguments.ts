import { isRequestObject } from '@/remote/worker/utils/isRequestObject';

export const getMethodFromFetchRequestArguments = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): string => init?.method ?? (isRequestObject(input) ? input.method : 'GET');
