const SURROUNDING_WHITESPACE_PATTERN = /^(\s*)([\s\S]*?)(\s*)$/;

export const splitSurroundingWhitespace = (
  text: string,
): { leading: string; content: string; trailing: string } => {
  const [, leading = '', content = '', trailing = ''] =
    SURROUNDING_WHITESPACE_PATTERN.exec(text) ?? [];

  return { leading, content, trailing };
};
