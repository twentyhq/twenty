import sharp from 'sharp';
import { afterEach, assert, describe, expect, it, vi } from 'vitest';

import {
  CAMERA_TILE_PLATE_SIZE,
  CAMERA_TILE_PLATE_TOP,
} from 'src/logic-functions/constants/camera-tile-config';
import { RECALL_BOT_IMAGE_WIDTH } from 'src/logic-functions/constants/recall-bot-image-config';
import { renderCameraTileLogo } from 'src/logic-functions/domain/render-camera-tile-logo.util';

const readPixel = async ({
  image,
  x,
  y,
}: {
  image: Buffer;
  x: number;
  y: number;
}) => {
  const { data, info } = await sharp(image)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const offset = (y * info.width + x) * info.channels;

  return Array.from(data.subarray(offset, offset + info.channels));
};

describe('renderCameraTileLogo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('covers the plate with the center of a wide logo and clips it to the rounded corners', async () => {
    const wideLogo = await sharp({
      create: { width: 400, height: 150, channels: 3, background: '#f00' },
    })
      .composite([
        {
          input: {
            create: {
              width: 200,
              height: 150,
              channels: 3,
              background: '#000',
            },
          },
          left: 100,
          top: 0,
        },
      ])
      .png()
      .toBuffer();

    const overlay = await renderCameraTileLogo({ sharp, logo: wideLogo });
    const image = overlay?.input;

    assert(Buffer.isBuffer(image));

    expect(overlay).toMatchObject({
      left: (RECALL_BOT_IMAGE_WIDTH - CAMERA_TILE_PLATE_SIZE) / 2,
      top: CAMERA_TILE_PLATE_TOP,
    });
    expect(await sharp(image).metadata()).toMatchObject({
      width: CAMERA_TILE_PLATE_SIZE,
      height: CAMERA_TILE_PLATE_SIZE,
      hasAlpha: true,
    });
    expect(await readPixel({ image, x: 100, y: 5 })).toEqual([0, 0, 0, 255]);
    expect(await readPixel({ image, x: 10, y: 100 })).toEqual([0, 0, 0, 255]);
    expect(await readPixel({ image, x: 190, y: 100 })).toEqual([0, 0, 0, 255]);
    expect((await readPixel({ image, x: 0, y: 0 }))[3]).toBe(0);
  });

  it('drops a logo that cannot be decoded', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      await renderCameraTileLogo({ sharp, logo: Buffer.from('not an image') }),
    ).toBeUndefined();
  });
});
