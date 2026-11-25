import sharp from 'sharp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CAMERA_TILE_POWERED_BY_LABEL } from 'src/logic-functions/constants/camera-tile-config';
import { buildCameraTileWorkspaceComposites } from 'src/logic-functions/domain/build-camera-tile-workspace-composites.util';
import { type CameraTileTextRenderer } from 'src/logic-functions/types/camera-tile-text-renderer.type';

const renderText = vi.fn<CameraTileTextRenderer>(async () => ({
  input: Buffer.from([]),
  width: 200,
  height: 30,
}));

const renderedTexts = () => renderText.mock.calls.map(([{ text }]) => text);

const buildLogo = () =>
  sharp({
    create: { width: 64, height: 64, channels: 3, background: '#f25f29' },
  })
    .png()
    .toBuffer();

describe('buildCameraTileWorkspaceComposites', () => {
  beforeEach(() => {
    renderText.mockClear();
  });

  it('draws the workspace name with Powered by twenty.com under it', async () => {
    const composites = await buildCameraTileWorkspaceComposites({
      sharp,
      renderText,
      branding: { logo: await buildLogo(), displayName: 'Acme Inc.' },
    });

    expect(composites).toBeDefined();
    expect(renderedTexts()).toEqual([
      'Acme Inc.',
      CAMERA_TILE_POWERED_BY_LABEL,
    ]);
  });

  it('keeps Powered by twenty.com under a logo whose workspace name cannot be drawn', async () => {
    const composites = await buildCameraTileWorkspaceComposites({
      sharp,
      renderText,
      branding: { logo: await buildLogo(), displayName: '日本商事' },
    });

    expect(composites).toBeDefined();
    expect(renderedTexts()).toEqual([CAMERA_TILE_POWERED_BY_LABEL]);
  });

  it('leaves the tile to the Twenty fallback without a logo or a drawable name', async () => {
    const composites = await buildCameraTileWorkspaceComposites({
      sharp,
      renderText,
      branding: { logo: undefined, displayName: '日本商事' },
    });

    expect(composites).toBeUndefined();
    expect(renderText).not.toHaveBeenCalled();
  });
});
