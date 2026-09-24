import { isDefined } from 'twenty-shared/utils';

import { type CompileSelectorTokenList } from '@/polyfills/selectors/css-select/types/CompileSelectorTokenList';
import { type SelectorCompilationOptions } from '@/polyfills/selectors/css-select/types/SelectorCompilationOptions';
import { type SelectorToken } from '@/polyfills/selectors/css-select/types/SelectorToken';
import { collectNextSiblingElements } from '@/polyfills/selectors/css-select/utils/collectNextSiblingElements';
import { isSelectorTraversalToken } from '@/polyfills/selectors/css-select/utils/isSelectorTraversalToken';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';
import { findFirstMatchingDescendant } from '@/polyfills/selectors/utils/findFirstMatchingDescendant';

const isHasSubjectElement: CompiledSelectorMatcher = (element, context) =>
  element === context.hasSubjectElement;

const anchorRelativeSelectorTokens = (
  tokens: SelectorToken[],
): SelectorToken[] =>
  isDefined(tokens[0]) && isSelectorTraversalToken(tokens[0])
    ? tokens
    : [{ type: 'descendant' }, ...tokens];

const startsWithSiblingTraversal = (tokens: SelectorToken[]): boolean =>
  tokens[0].type === 'adjacent' || tokens[0].type === 'sibling';

export const compileHasPseudoClass = ({
  next,
  relativeSelectorTokenList,
  options,
  compileSelectorTokenList,
}: {
  next: CompiledSelectorMatcher;
  relativeSelectorTokenList: SelectorToken[][];
  options: SelectorCompilationOptions;
  compileSelectorTokenList: CompileSelectorTokenList;
}): CompiledSelectorMatcher => {
  if (options.isInsideHasArgument) {
    throw new Error(':has() cannot be nested');
  }

  const anchoredSelectorTokenList = relativeSelectorTokenList.map(
    anchorRelativeSelectorTokens,
  );
  const relativeSelectorMatcher = compileSelectorTokenList({
    tokenList: anchoredSelectorTokenList,
    options: { isNested: true, isInsideHasArgument: true },
    relativeSelectorAnchorMatcher: isHasSubjectElement,
  });
  const shouldTestNextSiblings = anchoredSelectorTokenList.some(
    startsWithSiblingTraversal,
  );

  return (element, context) => {
    if (!next(element, context)) {
      return false;
    }

    const hasContext = { ...context, hasSubjectElement: element };
    const childNodes = collectChildNodes(element);

    return isDefined(
      findFirstMatchingDescendant({
        nodes: shouldTestNextSiblings
          ? [...childNodes, ...collectNextSiblingElements(element)]
          : childNodes,
        isElementMatching: (candidate) =>
          relativeSelectorMatcher(candidate, hasContext),
      }),
    );
  };
};
