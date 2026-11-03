import { getPublicAssetUrl, isDefined } from 'twenty-sdk/utils';

import { fetchWithTimeout } from 'src/logic-functions/utils/fetch-with-timeout.util';

const publicAssetCache = new Map<string, Promise<Buffer>>();

const downloadPublicAssetOrThrow = async (path: string): Promise<Buffer> => {
  const response = await fetchWithTimeout(getPublicAssetUrl(path));

  if (!response.ok) {
    throw new Error(
      `failed to download public asset ${path}: status ${response.status}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
};

export const fetchPublicAssetOrThrow = (path: string): Promise<Buffer> => {
  const cachedAsset = publicAssetCache.get(path);

  if (isDefined(cachedAsset)) {
    return cachedAsset;
  }

  const asset = downloadPublicAssetOrThrow(path).catch((error: unknown) => {
    publicAssetCache.delete(path);
    throw error;
  });

  publicAssetCache.set(path, asset);

  return asset;
};
