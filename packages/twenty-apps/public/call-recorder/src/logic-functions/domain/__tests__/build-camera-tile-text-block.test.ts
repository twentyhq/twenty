import { describe, expect, it } from 'vitest';

import {
  CAMERA_TILE_TEXT_LINE_GAP,
  CAMERA_TILE_TEXT_TOP,
  CAMERA_TILE_TITLE_LINE_HEIGHT,
} from 'src/logic-functions/constants/camera-tile-config';
import { buildCameraTileTextBlock } from 'src/logic-functions/domain/build-camera-tile-text-block.util';

const line = (width: number) => ({
  input: Buffer.from([]),
  width,
  height: 30,
});

const tops = (composites: { top?: number }[]) =>
  composites.map(({ top }) => top);

describe('buildCameraTileTextBlock', () => {
  it('places a title alone at the top of the text area', () => {
    const { lineComposites } = buildCameraTileTextBlock({ title: line(200) });

    expect(tops(lineComposites)).toEqual([CAMERA_TILE_TEXT_TOP]);
  });

  it('places the subtitle one title line and a gap below the title', () => {
    const { lineComposites } = buildCameraTileTextBlock({
      title: line(200),
      subtitle: line(300),
    });

    expect(tops(lineComposites)).toEqual([
      CAMERA_TILE_TEXT_TOP,
      CAMERA_TILE_TEXT_TOP +
        CAMERA_TILE_TITLE_LINE_HEIGHT +
        CAMERA_TILE_TEXT_LINE_GAP,
    ]);
  });

  it('moves a subtitle without a title up to the top of the text area', () => {
    const { lineComposites } = buildCameraTileTextBlock({
      subtitle: line(300),
    });

    expect(tops(lineComposites)).toEqual([CAMERA_TILE_TEXT_TOP]);
  });
});
