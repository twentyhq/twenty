import { stripMarkdown } from '~/utils/string/stripMarkdown';

export const getApplicationDescriptionSummary = (
  description?: string | null,
): string => {
  if (!description) {
    return '';
  }

  for (const block of description.split(/\n\s*\n/)) {
    const summary = stripMarkdown(block);

    if (summary.length > 0) {
      return summary;
    }
  }

  return '';
};
