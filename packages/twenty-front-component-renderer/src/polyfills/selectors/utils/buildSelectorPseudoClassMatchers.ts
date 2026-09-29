import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { UNOBSERVABLE_PSEUDO_CLASS_NAMES } from '@/polyfills/selectors/constants/UnobservablePseudoClassNames';
import { type CssSelectPseudoClassMatchers } from '@/polyfills/selectors/types/CssSelectPseudoClassMatchers';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isDocumentNode } from '@/polyfills/selectors/utils/isDocumentNode';

// css-select reads whether a pseudo-class takes an argument from the matcher's
// arity, so these unused parameters are required.
const isNeverMatching = (_element: SelectorElementLike): boolean => false;

const isNeverMatchingWithArgument = (
  _element: SelectorElementLike,
  _argument?: string | null,
): boolean => false;

const isAlwaysMatching = (_element: SelectorElementLike): boolean => true;

export const buildSelectorPseudoClassMatchers = ({
  resolveActiveElement,
}: {
  resolveActiveElement: () => object | null;
}): CssSelectPseudoClassMatchers => {
  const isActiveElement = (element: SelectorElementLike): boolean =>
    element === resolveActiveElement();

  return {
    ...Object.fromEntries(
      UNOBSERVABLE_PSEUDO_CLASS_NAMES.map((pseudoClassName) => [
        pseudoClassName,
        isNeverMatching,
      ]),
    ),
    state: isNeverMatchingWithArgument,
    defined: isAlwaysMatching,
    root: (element) => isDocumentNode(element.parentNode),
    focus: isActiveElement,
    'focus-visible': isActiveElement,
    'focus-within': (element) =>
      isAncestorOrSelfOfNode(element, resolveActiveElement()),
  };
};
