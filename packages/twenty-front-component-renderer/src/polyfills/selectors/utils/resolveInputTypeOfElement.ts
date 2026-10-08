import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';

const DEFAULT_INPUT_TYPE = 'text';

export const resolveInputTypeOfElement = (
  element: SelectorElementLike,
): string =>
  readElementAttributeIgnoringCase(element, 'type')?.toLowerCase() ??
  DEFAULT_INPUT_TYPE;
