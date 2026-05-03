// Slack reactions.add `name` must be the shortcode without colons, e.g. thumbsup
const REACTION_NAME_PATTERN = /^[a-z0-9_+-]+$/i;

export const validateReactionName = (
  name: string,
): string | undefined => {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return 'Reaction name must not be empty.';
  }

  if (trimmed.length > 128) {
    return 'Reaction name is too long (max 128 characters).';
  }

  if (trimmed.includes(':')) {
    return 'Reaction name must not include colons (use e.g. thumbsup, not :thumbsup:).';
  }

  if (!REACTION_NAME_PATTERN.test(trimmed)) {
    return 'Reaction name contains invalid characters.';
  }

  return undefined;
};
