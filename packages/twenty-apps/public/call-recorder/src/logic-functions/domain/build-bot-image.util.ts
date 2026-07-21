import type { OverlayOptions } from 'sharp';

import {
  RECALL_BOT_IMAGE_HEIGHT,
  RECALL_BOT_IMAGE_JPEG_QUALITY,
  RECALL_BOT_IMAGE_LOGO_MAX_HEIGHT,
  RECALL_BOT_IMAGE_LOGO_MAX_WIDTH,
  RECALL_BOT_IMAGE_MAX_BYTES,
  RECALL_BOT_IMAGE_MIN_JPEG_QUALITY,
  RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_DOT_DIAMETER,
  RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_HEIGHT,
  RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_INSET,
  RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_WIDTH,
  RECALL_BOT_IMAGE_WIDTH,
} from 'src/logic-functions/constants/recall-bot-image-config';

const JPEG_QUALITY_STEP = 10;
const RECORDING_STATUS_BADGE_BACKGROUND = '#feebec';
const RECORDING_STATUS_BADGE_COLOR = '#ce2c31';
const RECORDING_STATUS_BADGE_TEXT = 'REC';

type SharpFactory = typeof import('sharp');

export const buildBotImage = async ({
  logoBuffer,
  background,
  withRecordingStatusBadge = false,
}: {
  logoBuffer: Buffer;
  background: string;
  withRecordingStatusBadge?: boolean;
}): Promise<string | undefined> => {
  try {
    // Loaded on use so the native module isn't required when the manifest build
    // merely imports this module.
    const sharp = await loadSharp();

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

    if (withRecordingStatusBadge) {
      composites.push({
        input: await buildRecordingStatusBadge(sharp),
        top: RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_INSET,
        left: RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_INSET,
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
  sharp: SharpFactory;
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

const buildRecordingStatusBadge = (sharp: SharpFactory): Promise<Buffer> => {
  const badgeCornerRadius = RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_HEIGHT / 2;
  const recordingDotCenter = RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_HEIGHT / 2;
  const recordingDotRadius =
    RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_DOT_DIAMETER / 2;
  const recordingStatusTextBaseline =
    RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_HEIGHT / 2 + 7;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_WIDTH}" height="${RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_HEIGHT}">`,
    `<rect width="${RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_WIDTH}" height="${RECALL_BOT_IMAGE_RECORDING_STATUS_BADGE_HEIGHT}" rx="${badgeCornerRadius}" fill="${RECORDING_STATUS_BADGE_BACKGROUND}" fill-opacity="0.96" />`,
    `<circle cx="${recordingDotCenter}" cy="${recordingDotCenter}" r="${recordingDotRadius}" fill="${RECORDING_STATUS_BADGE_COLOR}" />`,
    `<text x="44" y="${recordingStatusTextBaseline}" fill="${RECORDING_STATUS_BADGE_COLOR}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600" letter-spacing="0">${RECORDING_STATUS_BADGE_TEXT}</text>`,
    '</svg>',
  ].join('');

  return sharp(Buffer.from(svg)).png().toBuffer();
};

const loadSharp = async (): Promise<SharpFactory> => {
  const sharpModule = await import('sharp');

  return ((sharpModule.default as unknown as { default?: SharpFactory })
    .default ?? sharpModule.default) as SharpFactory;
};
