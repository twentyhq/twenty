import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { canElementBeRequired } from '@/polyfills/selectors/utils/canElementBeRequired';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';

export const isElementRequired = (element: SelectorElementLike): boolean =>
  canElementBeRequired(element) &&
  hasElementAttributeIgnoringCase(element, 'required');
