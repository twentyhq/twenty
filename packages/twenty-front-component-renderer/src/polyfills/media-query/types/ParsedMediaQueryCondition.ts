import { type MediaQueryComparison } from '@/polyfills/media-query/types/MediaQueryComparison';
import { type MediaQueryNumericSource } from '@/polyfills/media-query/types/MediaQueryNumericSource';
import { type MediaQueryOrientation } from '@/polyfills/media-query/types/MediaQueryOrientation';

export type ParsedMediaQueryCondition =
  | {
      kind: 'numeric';
      source: MediaQueryNumericSource;
      comparison: MediaQueryComparison;
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
      kind: 'color-scheme';
      value: 'light' | 'dark';
    }
  | {
      kind: 'orientation';
      value: MediaQueryOrientation;
    };
