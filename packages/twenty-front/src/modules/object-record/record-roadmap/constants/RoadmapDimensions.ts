// Vertical layout constants for the timeline. The values intentionally stay
// on an 8px spacing rhythm so the bars align with the row dividers without
// fractional pixels.

export const ROADMAP_ROW_HEIGHT = 40;
// oxlint-disable-next-line twenty/max-consts-per-file
export const ROADMAP_BAR_HEIGHT = 24;
// oxlint-disable-next-line twenty/max-consts-per-file
export const ROADMAP_BAR_VERTICAL_PADDING =
  (ROADMAP_ROW_HEIGHT - ROADMAP_BAR_HEIGHT) / 2;
// oxlint-disable-next-line twenty/max-consts-per-file
export const ROADMAP_HEADER_HEIGHT = 48;
// oxlint-disable-next-line twenty/max-consts-per-file
export const ROADMAP_MIN_BAR_WIDTH = 8;
// Width of the sticky left-side name column. The value is a compromise
// between keeping long labels legible and leaving enough horizontal canvas
// for the bars on a 1280 px laptop screen.
// oxlint-disable-next-line twenty/max-consts-per-file
export const ROADMAP_NAME_COLUMN_WIDTH = 260;
// Width of each extra view-field column rendered next to the name. Wide
// enough to fit a SELECT chip + label, narrow enough that 4 columns still
// leave the bar canvas readable on a 1280 px screen.
// oxlint-disable-next-line twenty/max-consts-per-file
export const ROADMAP_NAME_COLUMN_FIELD_WIDTH = 140;
// Fixed swimlane header height — both the timeline and the left-side name
// column honor it so their rows stay row-for-row aligned.
// oxlint-disable-next-line twenty/max-consts-per-file
export const ROADMAP_SWIMLANE_HEADER_HEIGHT = 28;
