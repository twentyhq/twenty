import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

export type ParsedMediaQueryConditionParts = {
  knownConditions: ParsedMediaQueryCondition[];
  hasUnknownCondition: boolean;
};
