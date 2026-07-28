// The label is drawn as vector outlines rather than an SVG <text> element.
// sharp rasterizes SVG through Pango/fontconfig, which needs font files on the
// host, and the runtimes that execute this app ship none (Alpine for the local
// driver, Amazon Linux for Lambda). With nothing to match, Pango emits one
// .notdef box per character, so the badge rendered "REC" as three rectangles.
// Outlines depend on no ambient state and rasterize identically everywhere.

export const RECORDING_STATUS_BADGE_HEIGHT = 48;
export const RECORDING_STATUS_BADGE_INSET = 56;
export const RECORDING_STATUS_BADGE_PADDING = 18;
export const RECORDING_STATUS_BADGE_DOT_DIAMETER = 12;
export const RECORDING_STATUS_BADGE_DOT_LABEL_GAP = 12;
export const RECORDING_STATUS_BADGE_BACKGROUND = '#feebec';
export const RECORDING_STATUS_BADGE_BACKGROUND_OPACITY = 0.96;
export const RECORDING_STATUS_BADGE_COLOR = '#ce2c31';
export const RECORDING_STATUS_BADGE_LABEL_CAP_HEIGHT = 20;
export const RECORDING_STATUS_BADGE_LABEL_LETTER_SPACING = 3;

type RecordingStatusBadgeGlyph = {
  advanceWidth: number;
  outline: string;
};

// Authored on a 20px cap-height grid with the origin at the cap line, so a
// glyph is placed by translating it to its baseline-independent top-left. The
// R is a single subpath plus its counter, cut out by fill-rule="evenodd".
export const RECORDING_STATUS_BADGE_LABEL_GLYPHS: RecordingStatusBadgeGlyph[] = [
  {
    // R
    advanceWidth: 13.6,
    outline:
      'M0 0H8.4A5.2 5.2 0 0 1 8.4 10.4L13.4 20H9.6L6.2 10.4H3.4V20H0Z' +
      'M3.4 3.2H8A2 2 0 0 1 8 7.2H3.4Z',
  },
  {
    // E
    advanceWidth: 12,
    outline: 'M0 0H12V3.4H3.4V8.3H10.6V11.7H3.4V16.6H12V20H0Z',
  },
  {
    // C
    advanceWidth: 12.72,
    outline:
      'M12.72 3.57A7.2 10 0 1 0 12.72 16.43L10.11 14.24A3.8 6.6 0 1 1 10.11 5.76Z',
  },
];

export const RECORDING_STATUS_BADGE_LABEL_LEFT =
  RECORDING_STATUS_BADGE_PADDING +
  RECORDING_STATUS_BADGE_DOT_DIAMETER +
  RECORDING_STATUS_BADGE_DOT_LABEL_GAP;

export const RECORDING_STATUS_BADGE_LABEL_TOP =
  (RECORDING_STATUS_BADGE_HEIGHT - RECORDING_STATUS_BADGE_LABEL_CAP_HEIGHT) / 2;

export const RECORDING_STATUS_BADGE_LABEL_WIDTH =
  RECORDING_STATUS_BADGE_LABEL_GLYPHS.reduce(
    (total, glyph) => total + glyph.advanceWidth,
    0,
  ) +
  RECORDING_STATUS_BADGE_LABEL_LETTER_SPACING *
    (RECORDING_STATUS_BADGE_LABEL_GLYPHS.length - 1);

// Derived from its contents so the pill stays balanced when any of the parts
// above change; a hardcoded width silently mismatches the label it wraps.
export const RECORDING_STATUS_BADGE_WIDTH = Math.round(
  RECORDING_STATUS_BADGE_LABEL_LEFT +
    RECORDING_STATUS_BADGE_LABEL_WIDTH +
    RECORDING_STATUS_BADGE_PADDING,
);
