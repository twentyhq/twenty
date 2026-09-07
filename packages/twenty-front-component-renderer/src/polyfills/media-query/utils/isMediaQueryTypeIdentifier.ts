import { MEDIA_QUERY_RESERVED_KEYWORDS } from '@/polyfills/media-query/constants/MediaQueryReservedKeywords';

const MEDIA_TYPE_IDENTIFIER_PATTERN = /^-?[a-z_][a-z0-9_-]*$/;

export const isMediaQueryTypeIdentifier = (queryPart: string): boolean =>
  MEDIA_TYPE_IDENTIFIER_PATTERN.test(queryPart) &&
  !MEDIA_QUERY_RESERVED_KEYWORDS.has(queryPart);
