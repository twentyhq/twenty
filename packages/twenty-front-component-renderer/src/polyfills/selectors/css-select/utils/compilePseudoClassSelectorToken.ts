import { isArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ARGUMENT_PSEUDO_CLASS_MATCHER_BY_NAME } from '@/polyfills/selectors/constants/ArgumentPseudoClassMatcherByName';
import { FORGIVING_SELECTOR_LIST_PSEUDO_CLASS_NAMES } from '@/polyfills/selectors/constants/ForgivingSelectorListPseudoClassNames';
import { LEGACY_PSEUDO_ELEMENT_NAMES } from '@/polyfills/selectors/constants/LegacyPseudoElementNames';
import { NEVER_MATCHING_SELECTOR_MATCHER } from '@/polyfills/selectors/constants/NeverMatchingSelectorMatcher';
import { PSEUDO_CLASS_MATCHER_BY_NAME } from '@/polyfills/selectors/constants/PseudoClassMatcherByName';
import { NTH_PSEUDO_CLASS_COUNTING_BY_NAME } from '@/polyfills/selectors/css-select/constants/NthPseudoClassCountingByName';
import { type CompileSelectorTokenList } from '@/polyfills/selectors/css-select/types/CompileSelectorTokenList';
import { type PseudoClassSelectorToken } from '@/polyfills/selectors/css-select/types/PseudoClassSelectorToken';
import { type SelectorCompilationOptions } from '@/polyfills/selectors/css-select/types/SelectorCompilationOptions';
import { type SelectorToken } from '@/polyfills/selectors/css-select/types/SelectorToken';
import { compileHasPseudoClass } from '@/polyfills/selectors/css-select/utils/compileHasPseudoClass';
import { compileNthPseudoClass } from '@/polyfills/selectors/css-select/utils/compileNthPseudoClass';
import { unescapeCssText } from '@/polyfills/selectors/css-select/utils/unescapeCssText';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';

type PseudoClassCompilationInput = {
  options: SelectorCompilationOptions;
  compileSelectorTokenList: CompileSelectorTokenList;
};

const compileSupportedSelectors = ({
  tokenList,
  options,
  compileSelectorTokenList,
}: PseudoClassCompilationInput & {
  tokenList: SelectorToken[][];
}): CompiledSelectorMatcher[] =>
  tokenList.flatMap((tokens) => {
    try {
      return [compileSelectorTokenList({ tokenList: [tokens], options })];
    } catch {
      return [];
    }
  });

const compileSelectorListPseudoClass = ({
  name,
  tokenList,
  options,
  compileSelectorTokenList,
}: PseudoClassCompilationInput & {
  name: string;
  tokenList: SelectorToken[][];
}): CompiledSelectorMatcher => {
  const argumentOptions = { ...options, isNested: true };

  if (name === 'not') {
    const selectorListMatcher = compileSelectorTokenList({
      tokenList,
      options: argumentOptions,
    });

    return (element, context) => !selectorListMatcher(element, context);
  }

  if (!FORGIVING_SELECTOR_LIST_PSEUDO_CLASS_NAMES.has(name)) {
    throw new Error(`Unknown pseudo-class :${name}()`);
  }

  const supportedSelectorMatchers = compileSupportedSelectors({
    tokenList,
    options: argumentOptions,
    compileSelectorTokenList,
  });

  return isNonEmptyArray(supportedSelectorMatchers)
    ? (element, context) =>
        supportedSelectorMatchers.some((selectorMatcher) =>
          selectorMatcher(element, context),
        )
    : NEVER_MATCHING_SELECTOR_MATCHER;
};

const compileArgumentPseudoClass = ({
  name,
  argument,
  options,
  compileSelectorTokenList,
}: PseudoClassCompilationInput & {
  name: string;
  argument: string;
}): CompiledSelectorMatcher => {
  const nthPseudoClassCounting = NTH_PSEUDO_CLASS_COUNTING_BY_NAME.get(name);

  if (isDefined(nthPseudoClassCounting)) {
    return compileNthPseudoClass({
      argument,
      ...nthPseudoClassCounting,
      options,
      compileSelectorTokenList,
    });
  }

  const argumentPseudoClassMatcher =
    ARGUMENT_PSEUDO_CLASS_MATCHER_BY_NAME.get(name);
  const unescapedArgument = unescapeCssText(argument).trim();

  if (
    !isDefined(argumentPseudoClassMatcher) ||
    !isNonEmptyString(unescapedArgument)
  ) {
    throw new Error(`Unknown pseudo-class :${name}()`);
  }

  return (element) => argumentPseudoClassMatcher(element, unescapedArgument);
};

const resolveArgumentlessPseudoClassMatcher = (
  name: string,
): CompiledSelectorMatcher => {
  if (LEGACY_PSEUDO_ELEMENT_NAMES.has(name)) {
    return NEVER_MATCHING_SELECTOR_MATCHER;
  }

  const pseudoClassMatcher = PSEUDO_CLASS_MATCHER_BY_NAME.get(name);

  if (!isDefined(pseudoClassMatcher)) {
    throw new Error(`Unknown pseudo-class :${name}`);
  }

  return pseudoClassMatcher;
};

const resolvePseudoClassMatcher = ({
  token: { name, data },
  options,
  compileSelectorTokenList,
}: PseudoClassCompilationInput & {
  token: PseudoClassSelectorToken;
}): CompiledSelectorMatcher => {
  if (isArray(data)) {
    return compileSelectorListPseudoClass({
      name,
      tokenList: data,
      options,
      compileSelectorTokenList,
    });
  }

  if (isDefined(data)) {
    return compileArgumentPseudoClass({
      name,
      argument: data,
      options,
      compileSelectorTokenList,
    });
  }

  return resolveArgumentlessPseudoClassMatcher(name);
};

export const compilePseudoClassSelectorToken = ({
  next,
  token,
  options,
  compileSelectorTokenList,
}: PseudoClassCompilationInput & {
  next: CompiledSelectorMatcher;
  token: PseudoClassSelectorToken;
}): CompiledSelectorMatcher => {
  if (token.name === 'has' && isArray(token.data)) {
    return compileHasPseudoClass({
      next,
      relativeSelectorTokenList: token.data,
      options,
      compileSelectorTokenList,
    });
  }

  const pseudoClassMatcher = resolvePseudoClassMatcher({
    token,
    options,
    compileSelectorTokenList,
  });

  return (element, context) =>
    pseudoClassMatcher(element, context) && next(element, context);
};
