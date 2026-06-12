// Internal credits use micro-precision: $1 = 1,000,000 internal credits
// This mirrors the "micro" pattern in payment systems (e.g. microdollars → dollars)
export const INTERNAL_CREDITS_PER_DISPLAY_CREDIT = 1_000_000;

export const toDisplayCredits = (internalCredits: number): number =>
  internalCredits / INTERNAL_CREDITS_PER_DISPLAY_CREDIT;
