import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

export const resolveRadioButtonGroupScopeRoot = (
  radioButton: SelectorElementLike,
): SelectorElementLike => {
  let scopeRoot = radioButton;
  let ancestor = resolveParentElement(radioButton);

  while (isDefined(ancestor)) {
    if (
      normalizeRemoteTagNameToHtmlTagName(ancestor.localName ?? '') === 'form'
    ) {
      return ancestor;
    }

    scopeRoot = ancestor;
    ancestor = resolveParentElement(ancestor);
  }

  return scopeRoot;
};
