import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { generateCoverImage } from '@/cli/utilities/build/cover/generate-cover-image';

const createLogoBuffer = () =>
  sharp({
    create: {
      width: 200,
      height: 200,
      channels: 4,
      background: { r: 108, g: 92, b: 224, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

describe('generateCoverImage', () => {
  it('produces a 1600x1000 png from a logo buffer', async () => {
    const logoBuffer = await createLogoBuffer();

    const cover = await generateCoverImage({ logoBuffer });

    const metadata = await sharp(cover).metadata();
    expect(metadata.format).toBe('png');
    expect(metadata.width).toBe(1388);
    expect(metadata.height).toBe(858);
  });

  it('renders deterministically for the same logo', async () => {
    const logoBuffer = await createLogoBuffer();

    const first = await generateCoverImage({ logoBuffer });
    const second = await generateCoverImage({ logoBuffer });

    expect(first.equals(second)).toBe(true);
  });
});
