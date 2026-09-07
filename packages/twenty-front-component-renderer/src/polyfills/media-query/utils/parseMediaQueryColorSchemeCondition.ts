import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

export const parseMediaQueryColorSchemeCondition = (
  featureValue: string,
): ParsedMediaQueryCondition | null => {
  if (featureValue === 'light' || featureValue === 'dark') {
    return { kind: 'color-scheme', value: featureValue };
  }

  return null;
};
