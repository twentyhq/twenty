import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

const SUBMITTABLE_TAG_NAMES = new Set([
  'button',
  'input',
  'select',
  'textarea',
]);

const BUTTON_TYPES_BARRED_FROM_CONSTRAINT_VALIDATION = new Set([
  'button',
  'reset',
]);

const INPUT_TYPES_BARRED_FROM_CONSTRAINT_VALIDATION = new Set([
  'button',
  'hidden',
  'reset',
]);

const INPUT_TYPES_ACCEPTING_READONLY = new Set([
  'date',
  'datetime-local',
  'email',
  'month',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'time',
  'url',
  'week',
]);

const isInputBarredFromConstraintValidation = (
  element: SelectorElementLike,
): boolean => {
  const inputType = resolveInputTypeOfElement(element);

  return (
    INPUT_TYPES_BARRED_FROM_CONSTRAINT_VALIDATION.has(inputType) ||
    (INPUT_TYPES_ACCEPTING_READONLY.has(inputType) &&
      hasElementAttributeIgnoringCase(element, 'readonly'))
  );
};

const isButtonBarredFromConstraintValidation = (
  element: SelectorElementLike,
): boolean =>
  BUTTON_TYPES_BARRED_FROM_CONSTRAINT_VALIDATION.has(
    readElementAttributeIgnoringCase(element, 'type')?.toLowerCase() ?? '',
  );

const isElementBarredFromConstraintValidation = (
  element: SelectorElementLike,
): boolean => {
  switch (resolveHtmlTagNameOfElement(element)) {
    case 'input':
      return isInputBarredFromConstraintValidation(element);
    case 'button':
      return isButtonBarredFromConstraintValidation(element);
    case 'textarea':
      return hasElementAttributeIgnoringCase(element, 'readonly');
    default:
      return false;
  }
};

export const isElementCandidateForConstraintValidation = (
  element: SelectorElementLike,
): boolean =>
  SUBMITTABLE_TAG_NAMES.has(resolveHtmlTagNameOfElement(element)) &&
  !isElementDisabled(element) &&
  !isElementBarredFromConstraintValidation(element);
