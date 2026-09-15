import { type HostFetchResult } from '@/types/HostFetchResult';

const NULL_BODY_STATUSES = new Set([204, 205, 304]);

export const buildResponseFromHostFetchResult = (
  hostFetchResult: HostFetchResult,
): Response =>
  new Response(
    NULL_BODY_STATUSES.has(hostFetchResult.status)
      ? null
      : hostFetchResult.body,
    {
      status: hostFetchResult.status,
      statusText: hostFetchResult.statusText,
      headers: hostFetchResult.headers,
    },
  );
