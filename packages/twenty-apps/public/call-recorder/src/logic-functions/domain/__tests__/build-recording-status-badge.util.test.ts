import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import {
  RECORDING_STATUS_BADGE_HEIGHT,
  RECORDING_STATUS_BADGE_LABEL_LEFT,
  RECORDING_STATUS_BADGE_WIDTH,
} from 'src/logic-functions/constants/recording-status-badge-config';
import {
  buildRecordingStatusBadge,
  buildRecordingStatusBadgeSvg,
} from 'src/logic-functions/domain/build-recording-status-badge.util';

describe('buildRecordingStatusBadge', () => {
  it('draws the label without depending on any system font', () => {
    const svg = buildRecordingStatusBadgeSvg();

    expect(svg).not.toContain('<text');
    expect(svg).not.toContain('font-family');
  });

  it('renders a badge sized to its contents', async () => {
    const metadata = await sharp(
      await buildRecordingStatusBadge(sharp),
    ).metadata();

    expect(metadata.width).toBe(RECORDING_STATUS_BADGE_WIDTH);
    expect(metadata.height).toBe(RECORDING_STATUS_BADGE_HEIGHT);
  });

  it('rasterizes label ink to the right of the dot', async () => {
    const { data, info } = await sharp(await buildRecordingStatusBadge(sharp))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let labelInkPixelCount = 0;

    for (let y = 0; y < info.height; y++) {
      for (let x = RECORDING_STATUS_BADGE_LABEL_LEFT; x < info.width; x++) {
        const offset = (y * info.width + x) * info.channels;

        if (
          data[offset] > 150 &&
          data[offset + 1] < 120 &&
          data[offset + 2] < 120
        ) {
          labelInkPixelCount++;
        }
      }
    }

    expect(labelInkPixelCount).toBeGreaterThan(100);
  });
});
