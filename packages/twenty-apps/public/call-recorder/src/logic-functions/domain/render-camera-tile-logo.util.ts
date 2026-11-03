import { type OverlayOptions } from 'sharp';

import {
  CAMERA_TILE_PLATE_RADIUS,
  CAMERA_TILE_PLATE_SIZE,
  CAMERA_TILE_PLATE_TOP,
} from 'src/logic-functions/constants/camera-tile-config';
import { centerCameraTileItem } from 'src/logic-functions/domain/center-camera-tile-item.util';
import { type SharpFactory } from 'src/logic-functions/utils/load-sharp.util';

const PLATE_MASK = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${CAMERA_TILE_PLATE_SIZE}" height="${CAMERA_TILE_PLATE_SIZE}"><rect width="${CAMERA_TILE_PLATE_SIZE}" height="${CAMERA_TILE_PLATE_SIZE}" rx="${CAMERA_TILE_PLATE_RADIUS}" fill="#fff"/></svg>`,
);

export const renderCameraTileLogo = async ({
  sharp,
  logo,
}: {
  sharp: SharpFactory;
  logo: Buffer;
}): Promise<OverlayOptions | undefined> => {
  try {
    const plateLogo = await sharp(logo)
      .resize(CAMERA_TILE_PLATE_SIZE, CAMERA_TILE_PLATE_SIZE, { fit: 'cover' })
      .ensureAlpha()
      .composite([{ input: PLATE_MASK, blend: 'dest-in' }])
      .png()
      .toBuffer();

    return centerCameraTileItem({
      item: { input: plateLogo, width: CAMERA_TILE_PLATE_SIZE },
      top: CAMERA_TILE_PLATE_TOP,
    });
  } catch (error) {
    console.warn(
      `[call-recorder] failed to read workspace logo: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
