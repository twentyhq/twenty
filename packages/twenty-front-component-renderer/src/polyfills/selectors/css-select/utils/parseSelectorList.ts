import { isDefined } from 'twenty-shared/utils';

import { SELECTOR_LIST_PSEUDO_CLASS_NAMES } from '@/polyfills/selectors/constants/SelectorListPseudoClassNames';
import { ATTRIBUTE_SELECTOR_ACTION_BY_OPERATOR_PREFIX } from '@/polyfills/selectors/css-select/constants/AttributeSelectorActionByOperatorPrefix';
import { TRAVERSAL_TYPE_BY_COMBINATOR_CHARACTER } from '@/polyfills/selectors/css-select/constants/TraversalTypeByCombinatorCharacter';
import { type AttributeSelectorAction } from '@/polyfills/selectors/css-select/types/AttributeSelectorAction';
import { type SelectorToken } from '@/polyfills/selectors/css-select/types/SelectorToken';
import { type SelectorTraversalType } from '@/polyfills/selectors/css-select/types/SelectorTraversalType';
import { isSelectorTraversalToken } from '@/polyfills/selectors/css-select/utils/isSelectorTraversalToken';
import { unescapeCssText } from '@/polyfills/selectors/css-select/utils/unescapeCssText';

type SelectorParserState = {
  selectorsText: string;
  selectorIndex: number;
  tokens: SelectorToken[];
  selectorList: SelectorToken[][];
};

const NAME_PATTERN = /^[^\\#]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\-\u00b0-\uFFFF])+/;

const isQuote = (character: string): boolean =>
  character === '"' || character === "'";

const isWhitespace = (character: string): boolean =>
  character === ' ' ||
  character === '\t' ||
  character === '\n' ||
  character === '\f' ||
  character === '\r';

const readCharacter = (state: SelectorParserState, offset = 0): string =>
  state.selectorsText.charAt(state.selectorIndex + offset);

const readName = (state: SelectorParserState, offset: number): string => {
  const nameMatch = NAME_PATTERN.exec(
    state.selectorsText.slice(state.selectorIndex + offset),
  );

  if (!isDefined(nameMatch)) {
    throw new Error(
      `Expected name, found ${state.selectorsText.slice(state.selectorIndex)}`,
    );
  }

  const [name] = nameMatch;

  state.selectorIndex += offset + name.length;

  return unescapeCssText(name);
};

const stripWhitespace = (state: SelectorParserState, offset: number): void => {
  state.selectorIndex += offset;

  while (
    state.selectorIndex < state.selectorsText.length &&
    isWhitespace(readCharacter(state))
  ) {
    state.selectorIndex += 1;
  }
};

const isEscaped = (state: SelectorParserState, position: number): boolean => {
  let backslashCount = 0;

  while (state.selectorsText.charAt(position - backslashCount - 1) === '\\') {
    backslashCount += 1;
  }

  return backslashCount % 2 === 1;
};

const findClosingQuoteIndex = (
  state: SelectorParserState,
  openingQuoteIndex: number,
): number => {
  const quote = state.selectorsText.charAt(openingQuoteIndex);
  let closingQuoteIndex = openingQuoteIndex + 1;

  while (
    closingQuoteIndex < state.selectorsText.length &&
    (state.selectorsText.charAt(closingQuoteIndex) !== quote ||
      isEscaped(state, closingQuoteIndex))
  ) {
    closingQuoteIndex += 1;
  }

  return closingQuoteIndex;
};

const readValueWithParenthesis = (state: SelectorParserState): string => {
  state.selectorIndex += 1;

  const valueStartIndex = state.selectorIndex;
  let openParenthesisCount = 1;

  while (
    openParenthesisCount > 0 &&
    state.selectorIndex < state.selectorsText.length
  ) {
    const isUnescaped = !isEscaped(state, state.selectorIndex);

    if (isQuote(readCharacter(state)) && isUnescaped) {
      state.selectorIndex = findClosingQuoteIndex(state, state.selectorIndex);
    } else if (readCharacter(state) === '(' && isUnescaped) {
      openParenthesisCount += 1;
    } else if (readCharacter(state) === ')' && isUnescaped) {
      openParenthesisCount -= 1;
    }

    state.selectorIndex += 1;
  }

  if (openParenthesisCount > 0) {
    throw new Error('Parenthesis not matched');
  }

  return state.selectorsText.slice(valueStartIndex, state.selectorIndex - 1);
};

const ensureNotTraversal = (state: SelectorParserState): void => {
  const lastToken = state.tokens[state.tokens.length - 1];

  if (isDefined(lastToken) && isSelectorTraversalToken(lastToken)) {
    throw new Error('Did not expect successive traversals.');
  }
};

const addTraversal = (
  state: SelectorParserState,
  type: SelectorTraversalType,
): void => {
  const lastTokenIndex = state.tokens.length - 1;
  const lastToken = state.tokens[lastTokenIndex];

  if (isDefined(lastToken) && lastToken.type === 'descendant') {
    state.tokens[lastTokenIndex] = { type };

    return;
  }

  ensureNotTraversal(state);
  state.tokens.push({ type });
};

const addSpecialAttribute = (
  state: SelectorParserState,
  name: string,
  action: AttributeSelectorAction,
): void => {
  const value = readName(state, 1);

  state.tokens.push({
    type: 'attribute',
    name,
    action,
    value,
    namespace: null,
    ignoreCase: false,
  });
};

const finalizeSubselector = (state: SelectorParserState): void => {
  const lastToken = state.tokens[state.tokens.length - 1];

  if (isDefined(lastToken) && lastToken.type === 'descendant') {
    state.tokens.pop();
  }

  if (state.tokens.length === 0) {
    throw new Error('Empty sub-selector');
  }

  state.selectorList.push(state.tokens);
};

const readAttributeNameAndNamespace = (
  state: SelectorParserState,
): { name: string; namespace: string | null } => {
  if (readCharacter(state) === '|') {
    return { name: readName(state, 1), namespace: null };
  }

  if (state.selectorsText.startsWith('*|', state.selectorIndex)) {
    return { name: readName(state, 2), namespace: '*' };
  }

  const name = readName(state, 0);

  if (readCharacter(state) === '|' && readCharacter(state, 1) !== '=') {
    return { name: readName(state, 1), namespace: name };
  }

  return { name, namespace: null };
};

const readAttributeAction = (
  state: SelectorParserState,
): AttributeSelectorAction => {
  const prefixedAction = ATTRIBUTE_SELECTOR_ACTION_BY_OPERATOR_PREFIX.get(
    readCharacter(state),
  );

  if (isDefined(prefixedAction)) {
    if (readCharacter(state, 1) !== '=') {
      throw new Error('Expected `=`');
    }

    stripWhitespace(state, 2);

    return prefixedAction;
  }

  if (readCharacter(state) === '=') {
    stripWhitespace(state, 1);

    return 'equals';
  }

  return 'exists';
};

const readQuotedAttributeValue = (state: SelectorParserState): string => {
  const quote = readCharacter(state);
  const sectionEndIndex = findClosingQuoteIndex(state, state.selectorIndex);

  if (state.selectorsText.charAt(sectionEndIndex) !== quote) {
    throw new Error("Attribute value didn't end");
  }

  const value = unescapeCssText(
    state.selectorsText.slice(state.selectorIndex + 1, sectionEndIndex),
  );

  state.selectorIndex = sectionEndIndex + 1;

  return value;
};

const readUnquotedAttributeValue = (state: SelectorParserState): string => {
  const valueStartIndex = state.selectorIndex;

  while (
    state.selectorIndex < state.selectorsText.length &&
    ((!isWhitespace(readCharacter(state)) && readCharacter(state) !== ']') ||
      isEscaped(state, state.selectorIndex))
  ) {
    state.selectorIndex += 1;
  }

  return unescapeCssText(
    state.selectorsText.slice(valueStartIndex, state.selectorIndex),
  );
};

const readAttributeIgnoreCase = (
  state: SelectorParserState,
): boolean | null => {
  const caseModifier = readCharacter(state).toLowerCase();

  if (caseModifier !== 'i' && caseModifier !== 's') {
    return null;
  }

  stripWhitespace(state, 1);

  return caseModifier === 'i';
};

const parseAttributeSelector = (state: SelectorParserState): void => {
  stripWhitespace(state, 1);

  const { name, namespace } = readAttributeNameAndNamespace(state);

  stripWhitespace(state, 0);

  const action = readAttributeAction(state);
  let value = '';
  let ignoreCase: boolean | null = null;

  if (action !== 'exists') {
    value = isQuote(readCharacter(state))
      ? readQuotedAttributeValue(state)
      : readUnquotedAttributeValue(state);
    stripWhitespace(state, 0);
    ignoreCase = readAttributeIgnoreCase(state);
  }

  if (readCharacter(state) !== ']') {
    throw new Error("Attribute selector didn't terminate");
  }

  state.selectorIndex += 1;
  state.tokens.push({
    type: 'attribute',
    name,
    action,
    value,
    namespace,
    ignoreCase,
  });
};

const parsePseudoElement = (state: SelectorParserState): void => {
  const name = readName(state, 2).toLowerCase();
  const data =
    readCharacter(state) === '(' ? readValueWithParenthesis(state) : null;

  state.tokens.push({ type: 'pseudo-element', name, data });
};

const parsePseudoClass = (state: SelectorParserState): void => {
  const name = readName(state, 1).toLowerCase();

  if (readCharacter(state) !== '(') {
    state.tokens.push({ type: 'pseudo', name, data: null });

    return;
  }

  if (!SELECTOR_LIST_PSEUDO_CLASS_NAMES.has(name)) {
    state.tokens.push({
      type: 'pseudo',
      name,
      data: readValueWithParenthesis(state),
    });

    return;
  }

  if (isQuote(readCharacter(state, 1))) {
    throw new Error(`Pseudo-selector ${name} cannot be quoted`);
  }

  const argumentState: SelectorParserState = {
    selectorsText: state.selectorsText,
    selectorIndex: state.selectorIndex + 1,
    tokens: [],
    selectorList: [],
  };

  parseSelector(argumentState);

  if (readCharacter(argumentState) !== ')') {
    throw new Error(
      `Missing closing parenthesis in :${name} (${state.selectorsText})`,
    );
  }

  state.selectorIndex = argumentState.selectorIndex + 1;
  state.tokens.push({
    type: 'pseudo',
    name,
    data: argumentState.selectorList,
  });
};

const readTypeSelectorName = (state: SelectorParserState): string | null => {
  const firstCharacter = readCharacter(state);

  if (firstCharacter === '*') {
    state.selectorIndex += 1;

    return '*';
  }

  if (firstCharacter === '|' && readCharacter(state, 1) === '|') {
    throw new Error('Column combinators are not supported');
  }

  if (firstCharacter === '|') {
    return '';
  }

  return NAME_PATTERN.test(state.selectorsText.slice(state.selectorIndex))
    ? readName(state, 0)
    : null;
};

const readNamespacedTypeSelectorName = (state: SelectorParserState): string => {
  if (readCharacter(state, 1) !== '*') {
    return readName(state, 1);
  }

  state.selectorIndex += 2;

  return '*';
};

const parseTypeSelector = (state: SelectorParserState): boolean => {
  const namespaceOrName = readTypeSelectorName(state);

  if (!isDefined(namespaceOrName)) {
    return false;
  }

  const hasNamespace =
    readCharacter(state) === '|' && readCharacter(state, 1) !== '|';
  const namespace = hasNamespace ? namespaceOrName : null;
  const name = hasNamespace
    ? readNamespacedTypeSelectorName(state)
    : namespaceOrName;

  state.tokens.push(
    name === '*'
      ? { type: 'universal', namespace }
      : { type: 'tag', name, namespace },
  );

  return true;
};

const skipComment = (state: SelectorParserState): void => {
  const commentEndIndex = state.selectorsText.indexOf(
    '*/',
    state.selectorIndex + 2,
  );

  if (commentEndIndex < 0) {
    throw new Error('Comment was not terminated');
  }

  state.selectorIndex = commentEndIndex + 2;

  if (state.tokens.length === 0) {
    stripWhitespace(state, 0);
  }
};

const parseNextToken = (state: SelectorParserState): boolean => {
  const firstCharacter = readCharacter(state);
  const traversalType =
    TRAVERSAL_TYPE_BY_COMBINATOR_CHARACTER.get(firstCharacter);

  if (isWhitespace(firstCharacter)) {
    ensureNotTraversal(state);
    state.tokens.push({ type: 'descendant' });
    stripWhitespace(state, 1);

    return true;
  }

  if (isDefined(traversalType)) {
    addTraversal(state, traversalType);
    stripWhitespace(state, 1);

    return true;
  }

  switch (firstCharacter) {
    case '.':
      addSpecialAttribute(state, 'class', 'element');

      return true;
    case '#':
      addSpecialAttribute(state, 'id', 'equals');

      return true;
    case '[':
      parseAttributeSelector(state);

      return true;
    case ':':
      if (readCharacter(state, 1) === ':') {
        parsePseudoElement(state);
      } else {
        parsePseudoClass(state);
      }

      return true;
    case ',':
      finalizeSubselector(state);
      state.tokens = [];
      stripWhitespace(state, 1);

      return true;
    default:
      if (state.selectorsText.startsWith('/*', state.selectorIndex)) {
        skipComment(state);

        return true;
      }

      return parseTypeSelector(state);
  }
};

const parseSelector = (state: SelectorParserState): void => {
  stripWhitespace(state, 0);

  if (state.selectorIndex === state.selectorsText.length) {
    return;
  }

  let isParsingTokens = true;

  while (isParsingTokens && state.selectorIndex < state.selectorsText.length) {
    isParsingTokens = parseNextToken(state);
  }

  finalizeSubselector(state);
};

export const parseSelectorList = (selectorsText: string): SelectorToken[][] => {
  const state: SelectorParserState = {
    selectorsText,
    selectorIndex: 0,
    tokens: [],
    selectorList: [],
  };

  parseSelector(state);

  if (state.selectorIndex < selectorsText.length) {
    throw new Error(
      `Unmatched selector: ${selectorsText.slice(state.selectorIndex)}`,
    );
  }

  return state.selectorList;
};
