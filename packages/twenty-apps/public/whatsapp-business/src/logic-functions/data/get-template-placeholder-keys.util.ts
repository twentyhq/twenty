import { isNonEmptyString } from '@sniptt/guards';

const PLACEHOLDER_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

// unique placeholder keys in order of appearance: "1", "2" for positional templates, names for named ones
export const getTemplatePlaceholderKeys = (text: string | undefined): string[] =>
  isNonEmptyString(text) ? [...new Set([...text.matchAll(PLACEHOLDER_PATTERN)].map(([, key]) => key ?? ''))] : [];
