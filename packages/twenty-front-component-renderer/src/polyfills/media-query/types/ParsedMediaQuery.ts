import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

export type ParsedMediaQuery = {
  isNegated: boolean;
  matchesMediaType: boolean;
  conditions: ParsedMediaQueryCondition[];
};
