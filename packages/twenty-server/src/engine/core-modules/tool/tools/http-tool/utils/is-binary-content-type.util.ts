import { isNonEmptyString } from '@sniptt/guards';

const TEXT_CONTENT_TYPE_PATTERN =
  /^text\/|[/+](json|xml|javascript|x-www-form-urlencoded)\b/i;

export const isBinaryContentType = (contentType: string): boolean =>
  isNonEmptyString(contentType) && !TEXT_CONTENT_TYPE_PATTERN.test(contentType);
