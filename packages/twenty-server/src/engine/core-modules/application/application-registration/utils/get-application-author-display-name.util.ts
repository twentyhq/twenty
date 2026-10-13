import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject, parseJson } from 'twenty-shared/utils';

const getAuthorNameFromObject = (author: Record<string, unknown>) =>
  isNonEmptyString(author.name) && author.name.trim().length > 0
    ? author.name.trim()
    : null;

export const getApplicationAuthorDisplayName = (
  author: unknown,
): string | null => {
  if (isPlainObject(author)) {
    return getAuthorNameFromObject(author);
  }

  if (!isNonEmptyString(author)) {
    return null;
  }

  const trimmedAuthor = author.trim();

  if (trimmedAuthor.length === 0) {
    return null;
  }

  if (!trimmedAuthor.startsWith('{')) {
    return trimmedAuthor;
  }

  const parsedAuthor = parseJson<unknown>(trimmedAuthor);

  return isPlainObject(parsedAuthor)
    ? getAuthorNameFromObject(parsedAuthor)
    : trimmedAuthor;
};
