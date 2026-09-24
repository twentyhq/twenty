import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementCandidateForConstraintValidation } from '@/polyfills/selectors/utils/isElementCandidateForConstraintValidation';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

const TAG_NAMES_VALID_WITHOUT_INVALID_DESCENDANTS = new Set([
  'fieldset',
  'form',
]);

export const isElementValid = (element: SelectorElementLike): boolean =>
  TAG_NAMES_VALID_WITHOUT_INVALID_DESCENDANTS.has(
    resolveHtmlTagNameOfElement(element),
  ) || isElementCandidateForConstraintValidation(element);
