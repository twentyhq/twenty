import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import {
  RECORDING_STATUS_BADGE_HEIGHT,
  RECORDING_STATUS_BADGE_LABEL_CAP_HEIGHT,
  RECORDING_STATUS_BADGE_LABEL_GLYPHS,
  RECORDING_STATUS_BADGE_LABEL_LEFT,
  RECORDING_STATUS_BADGE_LABEL_LETTER_SPACING,
  RECORDING_STATUS_BADGE_LABEL_TOP,
  RECORDING_STATUS_BADGE_LABEL_WIDTH,
  RECORDING_STATUS_BADGE_WIDTH,
} from 'src/logic-functions/constants/recording-status-badge-config';
import {
  buildRecordingStatusBadge,
  buildRecordingStatusBadgeSvg,
} from 'src/logic-functions/domain/build-recording-status-badge.util';

const [rGlyph, eGlyph] = RECORDING_STATUS_BADGE_LABEL_GLYPHS;

const E_LEFT =
  RECORDING_STATUS_BADGE_LABEL_LEFT +
  rGlyph.advanceWidth +
  RECORDING_STATUS_BADGE_LABEL_LETTER_SPACING;

const C_LEFT =
  E_LEFT + eGlyph.advanceWidth + RECORDING_STATUS_BADGE_LABEL_LETTER_SPACING;

// Pixels the letterforms must and must not cover. A font fallback that shifts
// the label, or the .notdef boxes an <text> element degrades to on a font-less
// host, lands ink in a different place and fails these.
const LABEL_PROBES = [
  {
    name: 'R stem',
    x: Math.round(RECORDING_STATUS_BADGE_LABEL_LEFT + 1),
    y: 29,
    ink: true,
  },
  {
    name: 'R counter',
    x: Math.round(RECORDING_STATUS_BADGE_LABEL_LEFT + 6),
    y: 19,
    ink: false,
  },
  { name: 'E middle bar', x: Math.round(E_LEFT + 5), y: 24, ink: true },
  { name: 'C left stroke', x: Math.round(C_LEFT + 2), y: 24, ink: true },
  { name: 'C counter', x: Math.round(C_LEFT + 7), y: 24, ink: false },
];

const BOUNDS_TOLERANCE = 2;

type LabelInk = {
  isInk: (x: number, y: number) => boolean;
  bounds: { left: number; right: number; top: number; bottom: number };
};

const readLabelInk = async (badge: Buffer): Promise<LabelInk> => {
  const { data, info } = await sharp(badge)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const isInk = (x: number, y: number): boolean => {
    // A fractional or out-of-frame coordinate reads undefined and would report
    // "no ink", quietly passing every probe that expects background.
    if (
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      x < 0 ||
      y < 0 ||
      x >= info.width ||
      y >= info.height
    ) {
      throw new Error(`probe (${x}, ${y}) is outside the rendered badge`);
    }

    const offset = (y * info.width + x) * info.channels;

    return (
      data[offset] > 140 &&
      data[offset] < 230 &&
      data[offset + 1] < 100 &&
      data[offset + 2] < 100
    );
  };

  const inkCoordinates: { x: number; y: number }[] = [];

  for (let y = 0; y < info.height; y++) {
    for (let x = RECORDING_STATUS_BADGE_LABEL_LEFT - 4; x < info.width; x++) {
      if (isInk(x, y)) {
        inkCoordinates.push({ x, y });
      }
    }
  }

  return {
    isInk,
    bounds: {
      left: Math.min(...inkCoordinates.map(({ x }) => x)),
      right: Math.max(...inkCoordinates.map(({ x }) => x)),
      top: Math.min(...inkCoordinates.map(({ y }) => y)),
      bottom: Math.max(...inkCoordinates.map(({ y }) => y)),
    },
  };
};

describe('buildRecordingStatusBadge', () => {
  it('draws the label without depending on any system font', () => {
    const svg = buildRecordingStatusBadgeSvg();

    expect(svg).not.toContain('<text');
    expect(svg).not.toContain('font-family');
    expect(svg).not.toContain('font-size');
  });

  it('renders a badge sized to its contents', async () => {
    const metadata = await sharp(
      await buildRecordingStatusBadge(sharp),
    ).metadata();

    expect(metadata.width).toBe(RECORDING_STATUS_BADGE_WIDTH);
    expect(metadata.height).toBe(RECORDING_STATUS_BADGE_HEIGHT);
  });

  it('lays the label out where the badge geometry says it should be', async () => {
    const { bounds } = await readLabelInk(
      await buildRecordingStatusBadge(sharp),
    );

    const expectWithinTolerance = (actual: number, expected: number): void => {
      expect(Math.abs(actual - expected)).toBeLessThanOrEqual(
        BOUNDS_TOLERANCE,
      );
    };

    expectWithinTolerance(bounds.left, RECORDING_STATUS_BADGE_LABEL_LEFT);
    expectWithinTolerance(
      bounds.right,
      RECORDING_STATUS_BADGE_LABEL_LEFT + RECORDING_STATUS_BADGE_LABEL_WIDTH,
    );
    expectWithinTolerance(bounds.top, RECORDING_STATUS_BADGE_LABEL_TOP);
    expectWithinTolerance(
      bounds.bottom,
      RECORDING_STATUS_BADGE_LABEL_TOP +
        RECORDING_STATUS_BADGE_LABEL_CAP_HEIGHT,
    );
  });

  it.each(LABEL_PROBES)(
    'draws the $name letterform',
    async ({ x, y, ink }) => {
      const { isInk } = await readLabelInk(
        await buildRecordingStatusBadge(sharp),
      );

      expect(isInk(x, y)).toBe(ink);
    },
  );
});
