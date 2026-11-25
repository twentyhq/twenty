import { type OverlayOptions } from 'sharp';

import {
  RECALL_BOT_IMAGE_JPEG_QUALITY,
  RECALL_BOT_IMAGE_MAX_BYTES,
  RECALL_BOT_IMAGE_MIN_JPEG_QUALITY,
} from 'src/logic-functions/constants/recall-bot-image-config';
import { type SharpFactory } from 'src/logic-functions/utils/load-sharp.util';

const JPEG_QUALITY_STEP = 10;

const JPEG_QUALITIES = Array.from(
  {
    length:
      Math.floor(
        (RECALL_BOT_IMAGE_JPEG_QUALITY - RECALL_BOT_IMAGE_MIN_JPEG_QUALITY) /
          JPEG_QUALITY_STEP,
      ) + 1,
  },
  (_, index) => RECALL_BOT_IMAGE_JPEG_QUALITY - index * JPEG_QUALITY_STEP,
);

export const buildBotImage = async ({
  sharp,
  background,
  composites,
}: {
  sharp: SharpFactory;
  background: Buffer;
  composites: OverlayOptions[];
}): Promise<string | undefined> => {
  const composeJpeg = (quality: number) =>
    sharp(background)
      .composite(composites)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

  for (const quality of JPEG_QUALITIES) {
    const jpeg = await composeJpeg(quality);

    if (jpeg.byteLength <= RECALL_BOT_IMAGE_MAX_BYTES) {
      return jpeg.toString('base64');
    }
  }

  console.warn(
    '[call-recorder] camera tile could not be encoded under the Recall image size limit',
  );

  return undefined;
};
