import { getPublicAssetUrl } from 'twenty-sdk/utils';

const PUBLIC_ASSET_DOWNLOAD_TIMEOUT_MS = 30_000;

const publicAssetCache = new Map<string, Promise<Buffer>>();

const downloadPublicAsset = async (path: string): Promise<Buffer> => {
  const response = await fetch(getPublicAssetUrl(path), {
    signal: AbortSignal.timeout(PUBLIC_ASSET_DOWNLOAD_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `failed to download public asset ${path}: status ${response.status}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
};

// Cached per warm runtime: a calendar sweep schedules many bots in one run.
export const fetchPublicAsset = (path: string): Promise<Buffer> => {
  const cachedAsset = publicAssetCache.get(path);

  if (cachedAsset !== undefined) {
    return cachedAsset;
  }

  const asset = downloadPublicAsset(path).catch((error: unknown) => {
    publicAssetCache.delete(path);
    throw error;
  });

  publicAssetCache.set(path, asset);

  return asset;
};
