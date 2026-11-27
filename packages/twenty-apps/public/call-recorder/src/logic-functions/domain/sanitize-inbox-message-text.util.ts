const OPENING_BRACKET_PATTERN = /\[/g;
const CLOSING_BRACKET_PATTERN = /\]/g;

export const sanitizeInboxMessageText = (text: string): string =>
  text
    .replace(OPENING_BRACKET_PATTERN, '(')
    .replace(CLOSING_BRACKET_PATTERN, ')');
