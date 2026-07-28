import { isNonEmptyString } from '@sniptt/guards';

const ICON_NAME_PATTERN = /^Icon[A-Za-z0-9]+$/;

export const normalizeIconName = (
  requestedIconName: string | undefined,
): string | undefined => {
  if (!isNonEmptyString(requestedIconName)) {
    return undefined;
  }

  const trimmedIconName = requestedIconName.trim();

  if (ICON_NAME_PATTERN.test(trimmedIconName)) {
    return trimmedIconName;
  }

  const words = trimmedIconName
    .replace(/^icon[\s_-]*/i, '')
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  if (words.length === 0) {
    return undefined;
  }

  const normalizedIconName = `Icon${words.join('')}`;

  return ICON_NAME_PATTERN.test(normalizedIconName)
    ? normalizedIconName
    : undefined;
};
