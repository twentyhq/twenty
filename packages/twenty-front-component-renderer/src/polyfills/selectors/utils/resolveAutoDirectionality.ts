import { resolveDescendantTextDirectionality } from '@/polyfills/selectors/utils/resolveDescendantTextDirectionality';

import { type Directionality } from '@/polyfills/selectors/types/Directionality';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementValue } from '@/polyfills/selectors/utils/readElementValue';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveTextDirectionality } from '@/polyfills/selectors/utils/resolveTextDirectionality';

const TEXT_ENTRY_TAG_NAMES = new Set(['input', 'textarea']);

export const resolveAutoDirectionality = (
  element: SelectorElementLike,
): Directionality => {
  const textDirectionality = TEXT_ENTRY_TAG_NAMES.has(
    resolveHtmlTagNameOfElement(element),
  )
    ? resolveTextDirectionality(readElementValue(element) ?? '')
    : resolveDescendantTextDirectionality(element);

  return textDirectionality ?? 'ltr';
};
