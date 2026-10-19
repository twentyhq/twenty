import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { CSS_AT_RULE_START_REGEX } from '@/host/constants/CssAtRuleStartRegex';
import { readCssUrlTokenSegment } from '@/host/utils/readCssUrlTokenSegment';
import { getNextExpectedCssClosingDelimiters } from '@/polyfills/media-query/utils/getNextExpectedCssClosingDelimiters';
import { readCssTextSegment } from '@/polyfills/media-query/utils/readCssTextSegment';
import { trimCssWhitespace } from '@/polyfills/media-query/utils/trimCssWhitespace';

const BLOCK_CLOSING_DELIMITER = '}';

const AT_RULE_STATEMENT_TERMINATOR = ';';

// A rule with a `}` outside any block is invalid, and once wrapped in a
// layer block that brace would close the layer, so such rules are dropped.
export const splitCssIntoTopLevelRules = (cssText: string): string[] => {
  const rules: string[] = [];

  let currentRule = '';
  let hasUnmatchedClosingBrace = false;
  let expectedClosingDelimiters: string[] = [];
  let characterIndex = 0;

  const endCurrentRule = () => {
    if (
      !hasUnmatchedClosingBrace &&
      isNonEmptyString(trimCssWhitespace(currentRule))
    ) {
      rules.push(currentRule);
    }

    currentRule = '';
    hasUnmatchedClosingBrace = false;
  };

  while (characterIndex < cssText.length) {
    const segment =
      readCssUrlTokenSegment({ cssText, startIndex: characterIndex }) ??
      readCssTextSegment({ cssText, startIndex: characterIndex });

    currentRule += segment.text;
    characterIndex = segment.endIndex;

    if (!segment.isPlainCharacter) {
      continue;
    }

    const wasAtTopLevel = !isNonEmptyArray(expectedClosingDelimiters);

    if (wasAtTopLevel && segment.text === BLOCK_CLOSING_DELIMITER) {
      hasUnmatchedClosingBrace = true;
      continue;
    }

    expectedClosingDelimiters = getNextExpectedCssClosingDelimiters({
      expectedClosingDelimiters,
      character: segment.text,
    });

    const endsAtRuleStatement =
      wasAtTopLevel &&
      segment.text === AT_RULE_STATEMENT_TERMINATOR &&
      CSS_AT_RULE_START_REGEX.test(currentRule);
    const closesTopLevelBlock =
      !wasAtTopLevel &&
      !isNonEmptyArray(expectedClosingDelimiters) &&
      segment.text === BLOCK_CLOSING_DELIMITER;

    if (endsAtRuleStatement || closesTopLevelBlock) {
      endCurrentRule();
    }
  }

  currentRule += [...expectedClosingDelimiters].reverse().join('');
  endCurrentRule();

  return rules;
};
