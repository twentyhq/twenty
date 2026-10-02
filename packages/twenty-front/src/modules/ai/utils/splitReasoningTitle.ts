// OpenAI reasoning summaries open each section with a bold title line.
const REASONING_TITLE_PATTERN = /^\s*\*\*(.+?)\*\*[ \t]*(?:(?:\r?\n)+|$)/;

export const splitReasoningTitle = (
  text: string,
): { title: string | null; body: string } => {
  const match = text.match(REASONING_TITLE_PATTERN);
  const title = match?.[1].trim() ?? '';

  if (match === null || title.length === 0) {
    return { title: null, body: text.trim() };
  }

  return {
    title,
    body: text.slice(match[0].length).trim(),
  };
};
