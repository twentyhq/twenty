import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveInheritedAttributeValue } from '@/polyfills/selectors/utils/resolveInheritedAttributeValue';

type Directionality = 'ltr' | 'rtl';

const isDirectionality = (value: string): value is Directionality =>
  value === 'ltr' || value === 'rtl';

export const resolveElementDirectionality = (
  element: SelectorElementLike,
): Directionality => {
  const directionality = resolveInheritedAttributeValue({
    element,
    attributeName: 'dir',
    isValueAccepted: isDirectionality,
  });

  return isDefined(directionality) && isDirectionality(directionality)
    ? directionality
    : 'ltr';
};
