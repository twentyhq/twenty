import { type OverlayOptions } from 'sharp';

import {
  RECALL_BOT_IMAGE_BADGE_DIAMETER,
  RECALL_BOT_IMAGE_BADGE_INSET,
  RECALL_BOT_IMAGE_HEIGHT,
  RECALL_BOT_IMAGE_JPEG_QUALITY,
  RECALL_BOT_IMAGE_LOGO_MAX_HEIGHT,
  RECALL_BOT_IMAGE_LOGO_MAX_WIDTH,
  RECALL_BOT_IMAGE_MAX_BYTES,
  RECALL_BOT_IMAGE_MIN_JPEG_QUALITY,
  RECALL_BOT_IMAGE_WIDTH,
} from 'src/logic-functions/constants/recall-bot-image-config';

const JPEG_QUALITY_STEP = 10;

export const buildBotImage = async ({
  logoBuffer,
  background,
  withRecordingBadge = false,
}: {
  logoBuffer: Buffer;
  background: string;
  withRecordingBadge?: boolean;
}): Promise<string | undefined> => {
  try {
    // Loaded on use so the native module isn't required when the manifest build
    // merely imports this module.
    const sharp = (await import('sharp')).default;

    // Animated sources collapse to their first frame, which is the intended tile.
    const logo = await sharp(logoBuffer)
      .resize(
        RECALL_BOT_IMAGE_LOGO_MAX_WIDTH,
        RECALL_BOT_IMAGE_LOGO_MAX_HEIGHT,
        { fit: 'inside', withoutEnlargement: true },
      )
      .png()
      .toBuffer();

    const composites: OverlayOptions[] = [{ input: logo, gravity: 'center' }];

    if (withRecordingBadge) {
      composites.push({
        input: await buildRecordingBadge(sharp),
        top: RECALL_BOT_IMAGE_BADGE_INSET,
        left: RECALL_BOT_IMAGE_BADGE_INSET,
      });
    }

    let quality = RECALL_BOT_IMAGE_JPEG_QUALITY;
    let jpeg = await composeJpeg({ sharp, composites, background, quality });

    while (
      jpeg.byteLength > RECALL_BOT_IMAGE_MAX_BYTES &&
      quality - JPEG_QUALITY_STEP >= RECALL_BOT_IMAGE_MIN_JPEG_QUALITY
    ) {
      quality -= JPEG_QUALITY_STEP;
      jpeg = await composeJpeg({ sharp, composites, background, quality });
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

const composeJpeg = ({
  sharp,
  composites,
  background,
  quality,
}: {
  sharp: typeof import('sharp').default;
  composites: OverlayOptions[];
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
    .composite(composites)
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

// A red "recording" dot on a translucent white disk — shapes only, no fonts, so it
// renders reliably in the headless function runtime.
const buildRecordingBadge = (
  sharp: typeof import('sharp').default,
): Promise<Buffer> => {
  const radius = RECALL_BOT_IMAGE_BADGE_DIAMETER / 2;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${RECALL_BOT_IMAGE_BADGE_DIAMETER}" height="${RECALL_BOT_IMAGE_BADGE_DIAMETER}">`,
    `<circle cx="${radius}" cy="${radius}" r="${radius - 2}" fill="#ffffff" fill-opacity="0.9" />`,
    `<circle cx="${radius}" cy="${radius}" r="${radius * 0.55}" fill="#ea4335" />`,
    '</svg>',
  ].join('');

  return sharp(Buffer.from(svg)).png().toBuffer();
};
