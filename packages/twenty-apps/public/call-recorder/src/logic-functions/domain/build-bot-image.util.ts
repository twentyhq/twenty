import type { OverlayOptions } from 'sharp';

import {
  RECALL_BOT_IMAGE_HEIGHT,
  RECALL_BOT_IMAGE_JPEG_QUALITY,
  RECALL_BOT_IMAGE_LOGO_MAX_HEIGHT,
  RECALL_BOT_IMAGE_LOGO_MAX_WIDTH,
  RECALL_BOT_IMAGE_MAX_BYTES,
  RECALL_BOT_IMAGE_MIN_JPEG_QUALITY,
  RECALL_BOT_IMAGE_WIDTH,
} from 'src/logic-functions/constants/recall-bot-image-config';
import { RECORDING_STATUS_BADGE_INSET } from 'src/logic-functions/constants/recording-status-badge-config';
import { buildRecordingStatusBadge } from 'src/logic-functions/domain/build-recording-status-badge.util';

const JPEG_QUALITY_STEP = 10;

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
        top: RECORDING_STATUS_BADGE_INSET,
        left: RECORDING_STATUS_BADGE_INSET,
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

const loadSharp = async (): Promise<SharpFactory> => {
  const sharpModule = await import('sharp');

  return ((sharpModule.default as unknown as { default?: SharpFactory })
    .default ?? sharpModule.default) as SharpFactory;
};
