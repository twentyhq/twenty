import { getBlockStyle } from '@/advanced-text-editor/utils/getBlockStyle';

export const readBlockStyleAttribute = (
  element: HTMLElement,
): Record<string, string> => {
  try {
    return getBlockStyle(JSON.parse(element.getAttribute('data-style') ?? ''));
  } catch {
    return {};
  }
};
