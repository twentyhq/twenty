// DOMPurify's peak heap is a large multiple of the SVG, so bigger files are refused rather than sanitized.
export const MAX_SANITIZABLE_SVG_BYTES = 3 * 1024 * 1024;
