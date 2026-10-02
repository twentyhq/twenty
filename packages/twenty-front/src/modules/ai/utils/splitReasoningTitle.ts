// OpenAI reasoning summaries open each section with a bold title line.
const REASONING_TITLE_PATTERN = /^\s*\*\*([^*\n]+)\*\*[ \t]*(?:\n+|$)/;

export const splitReasoningTitle = (
  text: string,
): { title: string | null; body: string } => {
  const match = text.match(REASONING_TITLE_PATTERN);

  if (match === null) {
    return { title: null, body: text.trim() };
  }

  return {
    title: match[1].trim(),
    body: text.slice(match[0].length).trim(),
  };
};
