// Internal credits use micro-precision: $1 = 1,000,000 internal credits
// Display credits are 1000x coarser: $1 = 1,000 display credits
// This mirrors the "micro" pattern in payment systems (e.g. microdollars → dollars)
export const INTERNAL_CREDITS_PER_DISPLAY_CREDIT = 1000;

// Converts internal (high-precision) credits to user-facing display credits.
// Rounds to 1 decimal place for clean display (e.g. 7500 → 7.5).
export const toDisplayCredits = (internalCredits: number): number =>
  Math.round((internalCredits / INTERNAL_CREDITS_PER_DISPLAY_CREDIT) * 10) / 10;
