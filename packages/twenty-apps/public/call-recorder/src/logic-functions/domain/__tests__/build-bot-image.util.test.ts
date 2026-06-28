import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { buildBotImage } from 'src/logic-functions/domain/build-bot-image.util';
import {
  RECALL_BOT_IMAGE_HEIGHT,
  RECALL_BOT_IMAGE_MAX_BYTES,
  RECALL_BOT_IMAGE_WIDTH,
} from 'src/logic-functions/constants/recall-bot-image-config';

const createLogo = (format: 'png' | 'gif' | 'jpeg'): Promise<Buffer> => {
  const image = sharp({
    create: {
      width: 200,
      height: 200,
      channels: 3,
      background: '#3b82f6',
    },
  });

  if (format === 'png') {
    return image.png().toBuffer();
  }

  if (format === 'gif') {
    return image.gif().toBuffer();
  }

  return image.jpeg().toBuffer();
};

describe('buildBotImage', () => {
  it.each(['png', 'gif', 'jpeg'] as const)(
    'produces a 1280x720 JPEG under the size cap from a %s logo',
    async (format) => {
      const logoBuffer = await createLogo(format);

      const base64Jpeg = await buildBotImage({
        logoBuffer,
        background: '#ffffff',
      });

      expect(base64Jpeg).toBeDefined();

      const jpegBuffer = Buffer.from(base64Jpeg as string, 'base64');

      // JPEG SOI marker.
      expect(jpegBuffer[0]).toBe(0xff);
      expect(jpegBuffer[1]).toBe(0xd8);
      expect(jpegBuffer.byteLength).toBeLessThanOrEqual(
        RECALL_BOT_IMAGE_MAX_BYTES,
      );

      const metadata = await sharp(jpegBuffer).metadata();

      expect(metadata.width).toBe(RECALL_BOT_IMAGE_WIDTH);
      expect(metadata.height).toBe(RECALL_BOT_IMAGE_HEIGHT);
      expect(metadata.format).toBe('jpeg');
    },
  );

  it('returns undefined when the source cannot be decoded', async () => {
    const result = await buildBotImage({
      logoBuffer: Buffer.from('not-an-image'),
      background: '#ffffff',
    });

    expect(result).toBeUndefined();
  });
});
