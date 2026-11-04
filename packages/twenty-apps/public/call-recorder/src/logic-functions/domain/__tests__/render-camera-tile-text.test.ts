import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { renderCameraTileText } from 'src/logic-functions/domain/render-camera-tile-text.util';

const FONT_FILE_PATH = join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'public',
  'fonts',
  'Inter-SemiBold.ttf',
);
const MAX_WIDTH = 400;

const render = ({ text, maxWidth }: { text: string; maxWidth?: number }) =>
  renderCameraTileText({
    sharp,
    fontFilePath: FONT_FILE_PATH,
    text,
    fontSize: 44,
    maxWidth,
  });

describe('renderCameraTileText', () => {
  it('keeps text that fits at its natural size', async () => {
    const natural = await render({ text: 'Acme' });
    const constrained = await render({ text: 'Acme', maxWidth: MAX_WIDTH });

    expect(constrained.width).toBe(natural.width);
    expect(constrained.height).toBe(natural.height);
  });

  it('cuts text wider than the max width at its full size', async () => {
    const text = 'A workspace name long enough to overflow the camera tile';
    const natural = await render({ text });
    const constrained = await render({ text, maxWidth: MAX_WIDTH });

    expect(natural.width).toBeGreaterThan(MAX_WIDTH);
    expect(constrained.width).toBeLessThanOrEqual(MAX_WIDTH);
    expect(constrained.height).toBeGreaterThan(natural.height * 0.9);
  });
});
