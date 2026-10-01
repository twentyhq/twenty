import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

export const isInsideFirstLegendOfFieldset = ({
  element,
  fieldset,
}: {
  element: SelectorElementLike;
  fieldset: SelectorElementLike;
}): boolean => {
  const children = fieldset.childNodes ?? [];

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];

    if (
      isSelectorElementNode(child) &&
      resolveHtmlTagNameOfElement(child) === 'legend'
    ) {
      return isAncestorOrSelfOfNode(child, element);
    }
  }

  return false;
};
