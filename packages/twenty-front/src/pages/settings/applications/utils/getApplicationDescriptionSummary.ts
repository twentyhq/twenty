import { getPlainTextFromMarkdown } from '~/utils/string/getPlainTextFromMarkdown';

export const getApplicationDescriptionSummary = (
  description?: string | null,
): string => {
  if (!description) {
    return '';
  }

  for (const block of description.split(/\n\s*\n/)) {
    const summary = getPlainTextFromMarkdown(block);

    if (summary.length > 0) {
      return summary;
    }
  }

  return '';
};
