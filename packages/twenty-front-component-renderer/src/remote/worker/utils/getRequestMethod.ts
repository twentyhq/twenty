import { isRequestInput } from '@/remote/worker/utils/isRequestInput';

export const getRequestMethod = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): string => init?.method ?? (isRequestInput(input) ? input.method : 'GET');
