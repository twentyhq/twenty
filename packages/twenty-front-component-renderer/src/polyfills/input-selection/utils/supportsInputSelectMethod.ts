import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';
import { isTextLikeInputType } from '@/utils/isTextLikeInputType';

export const supportsInputSelectMethod = (
  element: SelectorElementLike,
): boolean =>
  resolveHtmlTagNameOfElement(element) === 'textarea' ||
  isTextLikeInputType(resolveInputTypeOfElement(element));
