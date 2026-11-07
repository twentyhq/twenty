const OPENING_BRACKET_PATTERN = /\[/g;
const CLOSING_BRACKET_PATTERN = /\]/g;
const LINE_BREAK_PATTERN = /\r?\n/g;

export const sanitizeInboxReferenceLabel = (label: string): string =>
  label
    .replace(OPENING_BRACKET_PATTERN, '(')
    .replace(CLOSING_BRACKET_PATTERN, ')')
    .replace(LINE_BREAK_PATTERN, ' ')
    .trim();
