import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

export const evaluateParsedMediaQueryCondition = (
  condition: ParsedMediaQueryCondition,
  environment: MediaQueryEnvironment,
): boolean => {
  if (condition.kind === 'color-scheme') {
    return condition.value === environment.colorScheme;
  }

  const currentValue = environment[condition.source];

  if (condition.comparison === 'min') {
    return currentValue >= condition.value;
  }

  if (condition.comparison === 'max') {
    return currentValue <= condition.value;
  }

  return currentValue === condition.value;
};
