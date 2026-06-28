import sharp from 'sharp';

import {
  RECALL_BOT_IMAGE_HEIGHT,
  RECALL_BOT_IMAGE_JPEG_QUALITY,
  RECALL_BOT_IMAGE_LOGO_MAX_HEIGHT,
  RECALL_BOT_IMAGE_LOGO_MAX_WIDTH,
  RECALL_BOT_IMAGE_MAX_BYTES,
  RECALL_BOT_IMAGE_MIN_JPEG_QUALITY,
  RECALL_BOT_IMAGE_WIDTH,
} from 'src/logic-functions/constants/recall-bot-image-config';

const JPEG_QUALITY_STEP = 10;

const composeJpeg = ({
  logo,
  background,
  quality,
}: {
  logo: Buffer;
  background: string;
  quality: number;
}): Promise<Buffer> =>
  sharp({
    create: {
      width: RECALL_BOT_IMAGE_WIDTH,
      height: RECALL_BOT_IMAGE_HEIGHT,
      channels: 3,
      background,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

// Composites the logo centered on a 1280x720 solid background and encodes a JPEG,
// stepping quality down until it fits Recall's size cap. Returns a base64 string,
// or undefined if the source can't be decoded or can't be shrunk under the cap.
export const buildBotImage = async ({
  logoBuffer,
  background,
}: {
  logoBuffer: Buffer;
  background: string;
}): Promise<string | undefined> => {
  try {
    // Animated sources collapse to their first frame; that is the intended
    // static tile behavior.
    const logo = await sharp(logoBuffer)
      .resize(
        RECALL_BOT_IMAGE_LOGO_MAX_WIDTH,
        RECALL_BOT_IMAGE_LOGO_MAX_HEIGHT,
        { fit: 'inside', withoutEnlargement: true },
      )
      .png()
      .toBuffer();

    let quality = RECALL_BOT_IMAGE_JPEG_QUALITY;
    let jpeg = await composeJpeg({ logo, background, quality });

    while (
      jpeg.byteLength > RECALL_BOT_IMAGE_MAX_BYTES &&
      quality - JPEG_QUALITY_STEP >= RECALL_BOT_IMAGE_MIN_JPEG_QUALITY
    ) {
      quality -= JPEG_QUALITY_STEP;
      jpeg = await composeJpeg({ logo, background, quality });
    }

    if (jpeg.byteLength > RECALL_BOT_IMAGE_MAX_BYTES) {
      console.warn(
        '[call-recorder] workspace logo could not be encoded under the Recall image size limit',
      );

      return undefined;
    }

    return jpeg.toString('base64');
  } catch (error) {
    console.warn(
      `[call-recorder] failed to build bot image from workspace logo: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
