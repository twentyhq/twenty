import { isDefined } from 'twenty-shared/utils';

import { type Directionality } from '@/polyfills/selectors/types/Directionality';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveAutoDirectionality } from '@/polyfills/selectors/utils/resolveAutoDirectionality';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

type DeclaredDirectionality = Directionality | 'auto';

const isDeclaredDirectionality = (
  value: string | undefined,
): value is DeclaredDirectionality =>
  value === 'ltr' || value === 'rtl' || value === 'auto';

const resolveDeclaredDirectionality = (
  element: SelectorElementLike,
): DeclaredDirectionality | null => {
  const directionality = readElementAttributeIgnoringCase(
    element,
    'dir',
  )?.toLowerCase();

  if (isDeclaredDirectionality(directionality)) {
    return directionality;
  }

  return resolveHtmlTagNameOfElement(element) === 'bdi' ? 'auto' : null;
};

export const resolveElementDirectionality = (
  element: SelectorElementLike,
): Directionality => {
  let currentElement: SelectorElementLike | null = element;

  while (isDefined(currentElement)) {
    const declaredDirectionality =
      resolveDeclaredDirectionality(currentElement);

    if (declaredDirectionality === 'auto') {
      return resolveAutoDirectionality(currentElement);
    }

    if (isDefined(declaredDirectionality)) {
      return declaredDirectionality;
    }

    currentElement = resolveParentElement(currentElement);
  }

  return 'ltr';
};
