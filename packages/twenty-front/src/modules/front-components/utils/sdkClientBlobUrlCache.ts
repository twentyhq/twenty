import { type SdkClientUrls } from 'twenty-sdk/front-component-renderer';

import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';

type SdkClientBlobUrls = SdkClientUrls;

// Deduplicates concurrent fetches: first caller creates the promise,
// subsequent callers for the same applicationId await the same one.
const cache = new Map<string, Promise<SdkClientBlobUrls>>();

const fetchAndCreateBlobUrl = async (
  url: string,
  token: string,
): Promise<string> => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch SDK module from ${url}: ${response.status}`,
    );
  }

  const source = await response.text();
  const blob = new Blob([source], { type: 'application/javascript' });

  return URL.createObjectURL(blob);
};

const fetchSdkClientBlobUrls = async (
  applicationId: string,
  accessToken: string,
): Promise<SdkClientBlobUrls> => {
  const urls = getSdkClientUrls(applicationId);

  const [coreBlobUrl, metadataBlobUrl] = await Promise.all([
    fetchAndCreateBlobUrl(urls.core, accessToken),
    fetchAndCreateBlobUrl(urls.metadata, accessToken),
  ]);

  return { core: coreBlobUrl, metadata: metadataBlobUrl };
};

export const getOrFetchSdkClientBlobUrls = (
  applicationId: string,
  accessToken: string,
): Promise<SdkClientBlobUrls> => {
  const existing = cache.get(applicationId);

  if (existing) {
    return existing;
  }

  const promise = fetchSdkClientBlobUrls(applicationId, accessToken).catch(
    (error) => {
      cache.delete(applicationId);
      throw error;
    },
  );

  cache.set(applicationId, promise);

  return promise;
};

export const invalidateSdkClientBlobUrls = (
  applicationId: string,
): void => {
  const existing = cache.get(applicationId);

  if (!existing) {
    return;
  }

  cache.delete(applicationId);

  existing.then((blobUrls) => {
    URL.revokeObjectURL(blobUrls.core);
    URL.revokeObjectURL(blobUrls.metadata);
  });
};
