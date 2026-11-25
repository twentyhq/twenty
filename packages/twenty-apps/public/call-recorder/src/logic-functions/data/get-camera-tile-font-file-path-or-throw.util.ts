import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isDefined } from 'twenty-sdk/utils';

import { CAMERA_TILE_FONT_ASSET_PATH } from 'src/logic-functions/constants/camera-tile-asset-paths';
import { fetchPublicAssetOrThrow } from 'src/logic-functions/data/fetch-public-asset-or-throw.util';

const FONT_FILE_PATH = join(
  tmpdir(),
  `call-recorder-inter-semibold-${process.pid}.ttf`,
);

const fontFilePathCache = new Map<string, Promise<string>>();

const writeFontFileOrThrow = async (): Promise<string> => {
  await writeFile(
    FONT_FILE_PATH,
    await fetchPublicAssetOrThrow(CAMERA_TILE_FONT_ASSET_PATH),
  );

  return FONT_FILE_PATH;
};

export const getCameraTileFontFilePathOrThrow = (): Promise<string> => {
  const cachedFontFilePath = fontFilePathCache.get(FONT_FILE_PATH);

  if (isDefined(cachedFontFilePath)) {
    return cachedFontFilePath;
  }

  const fontFilePath = writeFontFileOrThrow().catch((error: unknown) => {
    fontFilePathCache.delete(FONT_FILE_PATH);
    throw error;
  });

  fontFilePathCache.set(FONT_FILE_PATH, fontFilePath);

  return fontFilePath;
};
