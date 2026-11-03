import { type OverlayOptions } from 'sharp';

import {
  CAMERA_TILE_LOGO_BOX_SIZE,
  CAMERA_TILE_PLATE_SIZE,
  CAMERA_TILE_PLATE_TOP,
} from 'src/logic-functions/constants/camera-tile-config';
import { centerCameraTileItem } from 'src/logic-functions/domain/center-camera-tile-item.util';
import { type SharpFactory } from 'src/logic-functions/utils/load-sharp.util';

export const renderCameraTileLogo = async ({
  sharp,
  logo,
}: {
  sharp: SharpFactory;
  logo: Buffer;
}): Promise<OverlayOptions | undefined> => {
  try {
    const { data, info } = await sharp(logo)
      .resize(CAMERA_TILE_LOGO_BOX_SIZE, CAMERA_TILE_LOGO_BOX_SIZE, {
        fit: 'inside',
      })
      .png()
      .toBuffer({ resolveWithObject: true });

    return centerCameraTileItem({
      item: { input: data, width: info.width },
      top: CAMERA_TILE_PLATE_TOP + (CAMERA_TILE_PLATE_SIZE - info.height) / 2,
    });
  } catch (error) {
    console.warn(
      `[call-recorder] failed to read workspace logo: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
