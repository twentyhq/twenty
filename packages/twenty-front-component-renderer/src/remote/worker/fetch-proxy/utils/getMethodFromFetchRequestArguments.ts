import { isRequestObject } from '@/remote/worker/fetch-proxy/utils/isRequestObject';

export const getMethodFromFetchRequestArguments = (
  input: string | URL | Pick<Request, 'method'>,
  init: RequestInit | undefined,
): string => init?.method ?? (isRequestObject(input) ? input.method : 'GET');
