import { type MediaQueryComparisonOperator } from '@/polyfills/media-query/types/MediaQueryComparisonOperator';
import { type MediaQueryNumericSource } from '@/polyfills/media-query/types/MediaQueryNumericSource';

export type ParsedMediaQueryCondition =
  | {
      kind: 'numeric';
      source: MediaQueryNumericSource;
      operator: MediaQueryComparisonOperator;
      value: number;
    }
  | {
      kind: 'non-zero';
      source: MediaQueryNumericSource;
    }
  | {
      kind: 'always-matching';
    }
  | {
      kind: 'keyword';
      featureName: string;
      value: string;
    };
