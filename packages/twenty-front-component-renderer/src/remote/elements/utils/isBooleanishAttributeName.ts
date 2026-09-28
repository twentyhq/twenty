import { BOOLEANISH_ATTRIBUTE_NAMES } from '@/remote/elements/constants/BooleanishAttributeNames';

const ARIA_ATTRIBUTE_PREFIX = 'aria-';

export const isBooleanishAttributeName = (attributeName: string): boolean =>
  attributeName.startsWith(ARIA_ATTRIBUTE_PREFIX) ||
  BOOLEANISH_ATTRIBUTE_NAMES.has(attributeName);
