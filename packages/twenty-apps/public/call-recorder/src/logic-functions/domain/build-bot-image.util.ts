import { isUndefined } from '@sniptt/guards';
import { type OverlayOptions } from 'sharp';

import { CAMERA_TILE_BACKGROUND_COLOR } from 'src/logic-functions/constants/camera-tile-config';
import {
  RECALL_BOT_IMAGE_HEIGHT,
  RECALL_BOT_IMAGE_JPEG_QUALITY,
  RECALL_BOT_IMAGE_MAX_BYTES,
  RECALL_BOT_IMAGE_MIN_JPEG_QUALITY,
  RECALL_BOT_IMAGE_WIDTH,
} from 'src/logic-functions/constants/recall-bot-image-config';
import { type SharpFactory } from 'src/logic-functions/utils/load-sharp.util';

const JPEG_QUALITY_STEP = 10;

export const buildBotImage = async ({
  sharp,
  background,
  composites,
}: {
  sharp: SharpFactory;
  background: Buffer | undefined;
  composites: OverlayOptions[];
}): Promise<string | undefined> => {
  const composeJpeg = (quality: number) =>
    (isUndefined(background)
      ? sharp({
          create: {
            width: RECALL_BOT_IMAGE_WIDTH,
            height: RECALL_BOT_IMAGE_HEIGHT,
            channels: 3,
            background: CAMERA_TILE_BACKGROUND_COLOR,
          },
        })
      : sharp(background)
    )
      .composite(composites)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

  let quality = RECALL_BOT_IMAGE_JPEG_QUALITY;
  let jpeg = await composeJpeg(quality);

  while (
    jpeg.byteLength > RECALL_BOT_IMAGE_MAX_BYTES &&
    quality - JPEG_QUALITY_STEP >= RECALL_BOT_IMAGE_MIN_JPEG_QUALITY
  ) {
    quality -= JPEG_QUALITY_STEP;
    jpeg = await composeJpeg(quality);
  }

  if (jpeg.byteLength > RECALL_BOT_IMAGE_MAX_BYTES) {
    console.warn(
      '[call-recorder] camera tile could not be encoded under the Recall image size limit',
    );

    return undefined;
  }

  return jpeg.toString('base64');
};
