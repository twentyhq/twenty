// Must match how JSX collapses <Trans> whitespace, so build and runtime agree.
export const normalizeMessageWhitespace = (text: string): string =>
  text.replace(/\s+/g, ' ').trim();
