import { isString } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';

export const readElementValue = (element: SelectorElementLike): string | null =>
  isString(element.value)
    ? element.value
    : readElementAttributeIgnoringCase(element, 'value');
