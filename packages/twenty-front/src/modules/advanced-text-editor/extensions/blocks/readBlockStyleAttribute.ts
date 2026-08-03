import { getBlockStyle } from '@/advanced-text-editor/utils/getBlockStyle';

// The canvas DOM carries the structured style twice: as a style="" string for
// display and as data-style JSON for lossless round-tripping (ProseMirror
// serializes and re-parses its own DOM for the clipboard).
export const readBlockStyleAttribute = (
  element: HTMLElement,
): Record<string, string> => {
  try {
    return getBlockStyle(JSON.parse(element.getAttribute('data-style') ?? ''));
  } catch {
    return {};
  }
};
