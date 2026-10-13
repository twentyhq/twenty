import { getPlainTextFromMarkdown } from '~/utils/string/getPlainTextFromMarkdown';

// An image alt text is not a summary, so images are dropped before the first
// text block is picked.
const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\([^)]*\)/g;

export const getApplicationDescriptionSummary = (
  description?: string | null,
): string => {
  if (!description) {
    return '';
  }

  for (const block of description
    .replace(MARKDOWN_IMAGE_REGEX, '')
    .split(/\n\s*\n/)) {
    const summary = getPlainTextFromMarkdown(block);

    if (summary.length > 0) {
      return summary;
    }
  }

  return '';
};
