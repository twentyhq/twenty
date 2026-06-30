const stripMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^\s{0,3}(?:[-*+]\s+|\d+\.\s+)/gm, '')
    .replace(/[*_~`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

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
