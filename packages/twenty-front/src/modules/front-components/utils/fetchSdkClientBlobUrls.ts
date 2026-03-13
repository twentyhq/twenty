import { type SdkClientBlobUrls } from '@/front-components/states/sdkClientFamilyState';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';

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

export const fetchSdkClientBlobUrls = async (
  applicationId: string,
  accessToken: string,
): Promise<SdkClientBlobUrls> => {
  const urls = getSdkClientUrls(applicationId);

  const [coreResult, metadataResult] = await Promise.allSettled([
    fetchAndCreateBlobUrl(urls.core, accessToken),
    fetchAndCreateBlobUrl(urls.metadata, accessToken),
  ]);

  if (
    coreResult.status === 'fulfilled' &&
    metadataResult.status === 'fulfilled'
  ) {
    return { core: coreResult.value, metadata: metadataResult.value };
  }

  if (coreResult.status === 'fulfilled') {
    URL.revokeObjectURL(coreResult.value);
  }

  if (metadataResult.status === 'fulfilled') {
    URL.revokeObjectURL(metadataResult.value);
  }

  throw coreResult.status === 'rejected'
    ? coreResult.reason
    : metadataResult.status === 'rejected'
      ? metadataResult.reason
      : new Error('Unexpected SDK client fetch failure');
};
