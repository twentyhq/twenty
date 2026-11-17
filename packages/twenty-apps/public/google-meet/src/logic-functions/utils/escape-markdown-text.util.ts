const MARKDOWN_SPECIAL_CHARACTER_PATTERN = /[\\`*_[\]]/g;

export const escapeMarkdownText = (text: string): string =>
  text.replace(MARKDOWN_SPECIAL_CHARACTER_PATTERN, '\\$&');
