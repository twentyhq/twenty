import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';

export const hasElementAttributeIgnoringCase = (
  element: SelectorElementLike,
  attributeName: string,
): boolean =>
  isDefined(readElementAttributeIgnoringCase(element, attributeName));
