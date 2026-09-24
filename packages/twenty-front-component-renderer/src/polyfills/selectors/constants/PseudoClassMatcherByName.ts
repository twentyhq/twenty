import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { NEVER_MATCHING_SELECTOR_MATCHER } from '@/polyfills/selectors/constants/NeverMatchingSelectorMatcher';
import { UNOBSERVABLE_PSEUDO_CLASS_NAMES } from '@/polyfills/selectors/constants/UnobservablePseudoClassNames';
import { hasSiblingElement } from '@/polyfills/selectors/css-select/utils/hasSiblingElement';
import { isElementEmpty } from '@/polyfills/selectors/css-select/utils/isElementEmpty';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { isDocumentNode } from '@/polyfills/selectors/utils/isDocumentNode';

export const PSEUDO_CLASS_MATCHER_BY_NAME = new Map<
  string,
  CompiledSelectorMatcher
>([
  ...UNOBSERVABLE_PSEUDO_CLASS_NAMES.map(
    (pseudoClassName): [string, CompiledSelectorMatcher] => [
      pseudoClassName,
      NEVER_MATCHING_SELECTOR_MATCHER,
    ],
  ),
  ['defined', () => true],
  ['empty', isElementEmpty],
  [
    'first-child',
    (element) =>
      !hasSiblingElement({ element, direction: 'preceding', isOfType: false }),
  ],
  [
    'first-of-type',
    (element) =>
      !hasSiblingElement({ element, direction: 'preceding', isOfType: true }),
  ],
  ['focus', (element, { activeElement }) => element === activeElement],
  ['focus-visible', (element, { activeElement }) => element === activeElement],
  [
    'focus-within',
    (element, { activeElement }) =>
      isAncestorOrSelfOfNode(element, activeElement),
  ],
  [
    'last-child',
    (element) =>
      !hasSiblingElement({ element, direction: 'following', isOfType: false }),
  ],
  [
    'last-of-type',
    (element) =>
      !hasSiblingElement({ element, direction: 'following', isOfType: true }),
  ],
  [
    'only-child',
    (element) =>
      !hasSiblingElement({
        element,
        direction: 'preceding',
        isOfType: false,
      }) &&
      !hasSiblingElement({ element, direction: 'following', isOfType: false }),
  ],
  [
    'only-of-type',
    (element) =>
      !hasSiblingElement({ element, direction: 'preceding', isOfType: true }) &&
      !hasSiblingElement({ element, direction: 'following', isOfType: true }),
  ],
  ['root', (element) => isDocumentNode(element.parentNode)],
  ['scope', (element, { scopeElement }) => element === scopeElement],
]);
