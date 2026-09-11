import { isNonEmptyString } from '@sniptt/guards';

const MAX_MENTION_NAME_LENGTH = 80;
const LABEL_SUFFIX_FORGING_CHARACTERS_PATTERN = /[()]/g;

// Slack profile names are attacker-controlled: newlines let a name pose as its
// own prompt section and parentheses let it forge the "(workspace member …)"
// suffix the agent trusts for ids.
export const sanitizeSlackMentionName = (
  name: string | undefined,
): string | undefined => {
  const flattened = (name ?? '')
    .replace(LABEL_SUFFIX_FORGING_CHARACTERS_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_MENTION_NAME_LENGTH)
    .trim();

  return isNonEmptyString(flattened) ? flattened : undefined;
};
