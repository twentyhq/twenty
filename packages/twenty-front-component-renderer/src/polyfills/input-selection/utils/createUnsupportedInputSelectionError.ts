import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';
import { createDomException } from '@/polyfills/utils/createDomException';

export const createUnsupportedInputSelectionError = (
  element: SelectorElementLike,
): Error =>
  createDomException(
    `The input element's type ('${resolveInputTypeOfElement(element)}') does not support selection.`,
    'InvalidStateError',
  );
