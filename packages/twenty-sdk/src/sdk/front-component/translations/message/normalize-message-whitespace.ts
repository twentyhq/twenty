// Collapses runs of whitespace (including newlines/indentation) to a single
// space and trims. Applied to <Trans> text children on BOTH the build-time
// extractor and the runtime so a multi-line element produces the same catalog
// key on each side: JSX collapses children whitespace at render, while the
// extractor reads the raw source, so both must normalize identically to agree.
export const normalizeMessageWhitespace = (text: string): string =>
  text.replace(/\s+/g, ' ').trim();
