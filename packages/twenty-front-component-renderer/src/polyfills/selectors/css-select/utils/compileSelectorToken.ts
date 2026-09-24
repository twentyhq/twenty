import { isDefined } from 'twenty-shared/utils';

import { NEVER_MATCHING_SELECTOR_MATCHER } from '@/polyfills/selectors/constants/NeverMatchingSelectorMatcher';
import { type CompileSelectorTokenList } from '@/polyfills/selectors/css-select/types/CompileSelectorTokenList';
import { type SelectorCompilationOptions } from '@/polyfills/selectors/css-select/types/SelectorCompilationOptions';
import { type SelectorToken } from '@/polyfills/selectors/css-select/types/SelectorToken';
import { compileAttributeSelectorToken } from '@/polyfills/selectors/css-select/utils/compileAttributeSelectorToken';
import { compilePseudoClassSelectorToken } from '@/polyfills/selectors/css-select/utils/compilePseudoClassSelectorToken';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';
import { resolvePreviousSiblingElement } from '@/polyfills/selectors/utils/resolvePreviousSiblingElement';

type TraversedElementResolver = (
  element: SelectorElementLike,
) => SelectorElementLike | null;

const EMPTY_NAMESPACE = '';

const ANY_NAMESPACE = '*';

const assertNamespaceIsSupported = (namespace: string | null): void => {
  if (isDefined(namespace) && namespace !== ANY_NAMESPACE) {
    throw new Error(`Namespace prefix ${namespace} is not declared`);
  }
};

const createSingleStepTraversalMatcher =
  ({
    next,
    resolveTraversedElement,
  }: {
    next: CompiledSelectorMatcher;
    resolveTraversedElement: TraversedElementResolver;
  }): CompiledSelectorMatcher =>
  (element, context) => {
    const traversedElement = resolveTraversedElement(element);

    return isDefined(traversedElement) && next(traversedElement, context);
  };

const createRepeatedTraversalMatcher =
  ({
    next,
    resolveTraversedElement,
  }: {
    next: CompiledSelectorMatcher;
    resolveTraversedElement: TraversedElementResolver;
  }): CompiledSelectorMatcher =>
  (element, context) => {
    let traversedElement = resolveTraversedElement(element);

    while (isDefined(traversedElement)) {
      if (next(traversedElement, context)) {
        return true;
      }

      traversedElement = resolveTraversedElement(traversedElement);
    }

    return false;
  };

const compileTypeSelectorToken = ({
  next,
  name,
  namespace,
}: {
  next: CompiledSelectorMatcher;
  name: string | null;
  namespace: string | null;
}): CompiledSelectorMatcher => {
  if (namespace === EMPTY_NAMESPACE) {
    return NEVER_MATCHING_SELECTOR_MATCHER;
  }

  assertNamespaceIsSupported(namespace);

  if (!isDefined(name)) {
    return next;
  }

  const tagName = normalizeRemoteTagNameToHtmlTagName(name);

  return (element, context) =>
    resolveHtmlTagNameOfElement(element) === tagName && next(element, context);
};

export const compileSelectorToken = ({
  next,
  token,
  options,
  compileSelectorTokenList,
}: {
  next: CompiledSelectorMatcher;
  token: SelectorToken;
  options: SelectorCompilationOptions;
  compileSelectorTokenList: CompileSelectorTokenList;
}): CompiledSelectorMatcher => {
  switch (token.type) {
    case 'attribute':
      assertNamespaceIsSupported(token.namespace);

      return compileAttributeSelectorToken({ next, token });
    case 'pseudo':
      return compilePseudoClassSelectorToken({
        next,
        token,
        options,
        compileSelectorTokenList,
      });
    case 'pseudo-element':
      return NEVER_MATCHING_SELECTOR_MATCHER;
    case 'tag':
      return compileTypeSelectorToken({
        next,
        name: token.name,
        namespace: token.namespace,
      });
    case 'universal':
      return compileTypeSelectorToken({
        next,
        name: null,
        namespace: token.namespace,
      });
    case 'descendant':
      return createRepeatedTraversalMatcher({
        next,
        resolveTraversedElement: resolveParentElement,
      });
    case 'child':
      return createSingleStepTraversalMatcher({
        next,
        resolveTraversedElement: resolveParentElement,
      });
    case 'sibling':
      return createRepeatedTraversalMatcher({
        next,
        resolveTraversedElement: resolvePreviousSiblingElement,
      });
    case 'adjacent':
      return createSingleStepTraversalMatcher({
        next,
        resolveTraversedElement: resolvePreviousSiblingElement,
      });
  }
};
