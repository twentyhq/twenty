import { isNonEmptyString, isString } from '@sniptt/guards';

export const resolveImageSourceAttribute = (
  sourceAttribute: unknown,
): string | null =>
  isString(sourceAttribute) && isNonEmptyString(sourceAttribute.trim())
    ? sourceAttribute
    : null;
