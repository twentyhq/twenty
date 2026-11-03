import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { CAMERA_TILE_FONT_ASSET_PATH } from 'src/logic-functions/constants/camera-tile-asset-paths';
import { fetchPublicAsset } from 'src/logic-functions/data/fetch-public-asset.util';

const FONT_FILE_PATH = join(tmpdir(), 'call-recorder-inter-semibold.ttf');

let fontFilePath: Promise<string> | undefined;

// The runtime ships no fonts and sharp's text renderer only loads font files
// from disk, so the bundled font is written to the temp directory once.
export const getCameraTileFontFilePath = (): Promise<string> => {
  fontFilePath ??= fetchPublicAsset(CAMERA_TILE_FONT_ASSET_PATH)
    .then(async (font) => {
      await writeFile(FONT_FILE_PATH, font);

      return FONT_FILE_PATH;
    })
    .catch((error: unknown) => {
      fontFilePath = undefined;
      throw error;
    });

  return fontFilePath;
};
