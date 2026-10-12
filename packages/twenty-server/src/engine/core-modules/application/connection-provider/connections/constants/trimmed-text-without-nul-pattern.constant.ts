// PostgreSQL text columns reject NUL, and surrounding whitespace would let the
// same external account be stored under two distinct ids.
export const TRIMMED_TEXT_WITHOUT_NUL_PATTERN = /^[^\s\0](?:[^\0]*[^\s\0])?$/;
