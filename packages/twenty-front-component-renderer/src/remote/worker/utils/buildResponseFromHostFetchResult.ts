import { type HostFetchResult } from '@/types/HostFetchResult';

export const buildResponseFromHostFetchResult = (
  hostFetchResult: HostFetchResult,
): Response =>
  new Response(hostFetchResult.body, {
    status: hostFetchResult.status,
    statusText: hostFetchResult.statusText,
    headers: hostFetchResult.headers,
  });
