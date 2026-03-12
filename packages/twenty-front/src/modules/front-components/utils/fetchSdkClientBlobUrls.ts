import { type SdkClientBlobUrls } from '@/front-components/states/sdkClientBlobUrlsFamilyState';
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

  const [coreBlobUrl, metadataBlobUrl] = await Promise.all([
    fetchAndCreateBlobUrl(urls.core, accessToken),
    fetchAndCreateBlobUrl(urls.metadata, accessToken),
  ]);

  return { core: coreBlobUrl, metadata: metadataBlobUrl };
};
