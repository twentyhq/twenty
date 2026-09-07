// DOMPurify needs the whole SVG as a string plus a JSDOM tree, so the peak
// heap is a large multiple of the file. Anything bigger is refused rather
// than sanitized: node's max string length would throw well below the
// direct upload cap anyway.
export const MAX_SANITIZABLE_SVG_BYTES = 3 * 1024 * 1024;
