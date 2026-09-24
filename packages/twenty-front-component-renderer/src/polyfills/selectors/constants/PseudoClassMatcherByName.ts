import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { NEVER_MATCHING_SELECTOR_MATCHER } from '@/polyfills/selectors/constants/NeverMatchingSelectorMatcher';
import { UNOBSERVABLE_PSEUDO_CLASS_NAMES } from '@/polyfills/selectors/constants/UnobservablePseudoClassNames';
import { hasSiblingElement } from '@/polyfills/selectors/css-select/utils/hasSiblingElement';
import { isElementEmpty } from '@/polyfills/selectors/css-select/utils/isElementEmpty';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { canElementBeDisabled } from '@/polyfills/selectors/utils/canElementBeDisabled';
import { canElementBeRequired } from '@/polyfills/selectors/utils/canElementBeRequired';
import { isDocumentNode } from '@/polyfills/selectors/utils/isDocumentNode';
import { isElementChecked } from '@/polyfills/selectors/utils/isElementChecked';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { isElementIndeterminate } from '@/polyfills/selectors/utils/isElementIndeterminate';
import { isElementLink } from '@/polyfills/selectors/utils/isElementLink';
import { isElementOpen } from '@/polyfills/selectors/utils/isElementOpen';
import { isElementPlaceholderShown } from '@/polyfills/selectors/utils/isElementPlaceholderShown';
import { isElementReadWrite } from '@/polyfills/selectors/utils/isElementReadWrite';
import { isElementRequired } from '@/polyfills/selectors/utils/isElementRequired';

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
  ['any-link', isElementLink],
  ['checked', isElementChecked],
  ['defined', () => true],
  ['disabled', isElementDisabled],
  ['empty', isElementEmpty],
  [
    'enabled',
    (element) => canElementBeDisabled(element) && !isElementDisabled(element),
  ],
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
  ['indeterminate', isElementIndeterminate],
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
  ['link', isElementLink],
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
  ['open', isElementOpen],
  [
    'optional',
    (element) => canElementBeRequired(element) && !isElementRequired(element),
  ],
  ['placeholder-shown', isElementPlaceholderShown],
  ['read-only', (element) => !isElementReadWrite(element)],
  ['read-write', isElementReadWrite],
  ['required', isElementRequired],
  ['root', (element) => isDocumentNode(element.parentNode)],
  ['scope', (element, { scopeElement }) => element === scopeElement],
]);
