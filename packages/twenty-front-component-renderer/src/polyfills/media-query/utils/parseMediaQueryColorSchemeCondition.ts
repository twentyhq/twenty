import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

export const parseMediaQueryColorSchemeCondition = (
  featureValue: string,
): ParsedMediaQueryCondition | null => {
  if (
    featureValue === 'light' ||
    featureValue === 'dark' ||
    featureValue === 'no-preference'
  ) {
    return { kind: 'color-scheme', value: featureValue };
  }

  return null;
};
