import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { TWENTY_UI_CASCADE_LAYER_NAME } from '@/host/constants/TwentyUiCascadeLayerName';

const TWENTY_UI_CASCADE_LAYER_DECLARATION = `@layer ${TWENTY_UI_CASCADE_LAYER_NAME}`;

const ANONYMOUS_IMPORT_LAYER_PREFIX = 'anonymous-';

const COMMENT_START = '/*';

const LEADING_COMMENT_PATTERN = /^\s*\/\*[\s\S]*?\*\//;

const LEADING_TOP_LEVEL_AT_RULE_PATTERN = /^\s*@(?:charset|import|namespace)\b/;

const STATEMENT_TOKEN_PATTERN =
  /url\([^"'()]*\)|\/\*[\s\S]*?(?:\*\/|$)|"[^"]*"|'[^']*'|[();{]/g;

const BLOCK_TOKEN_PATTERN =
  /url\([^"'()]*\)|\/\*[\s\S]*?(?:\*\/|$)|"[^"]*"|'[^']*'|@layer\s+([\w.-]+)\s*\{|[{}]/g;

const IMPORT_LAYER_PATTERN =
  /@import\s*(url\([^)]*\)|"[^"]*"|'[^']*')(\s*\blayer\b(?:\(([^)]*)\))?)?/g;

type CssTextRange = {
  startIndex: number;
  endIndex: number;
};

const findStatementEndIndex = ({
  cssText,
  startIndex,
}: {
  cssText: string;
  startIndex: number;
}): number | undefined => {
  let parenthesisDepth = 0;

  for (const token of cssText
    .slice(startIndex)
    .matchAll(STATEMENT_TOKEN_PATTERN)) {
    if (token[0] === '{') {
      return undefined;
    }

    if (token[0] === ';' && parenthesisDepth === 0) {
      return startIndex + (token.index ?? 0);
    }

    if (token[0] === '(') {
      parenthesisDepth += 1;
    }

    if (token[0] === ')') {
      parenthesisDepth -= 1;
    }
  }

  return undefined;
};

const getLeadingStatementsEndIndex = ({
  cssText,
  startIndex,
}: {
  cssText: string;
  startIndex: number;
}): number => {
  const remainingCss = cssText.slice(startIndex);
  const leadingComment = remainingCss.match(LEADING_COMMENT_PATTERN)?.[0];

  if (isDefined(leadingComment)) {
    return getLeadingStatementsEndIndex({
      cssText,
      startIndex: startIndex + leadingComment.length,
    });
  }

  if (!LEADING_TOP_LEVEL_AT_RULE_PATTERN.test(remainingCss)) {
    return startIndex;
  }

  const statementEndIndex = findStatementEndIndex({ cssText, startIndex });

  return isDefined(statementEndIndex)
    ? getLeadingStatementsEndIndex({
        cssText,
        startIndex: statementEndIndex + 1,
      })
    : startIndex;
};

const replaceCommentTokenWithSpace = (token: string): string =>
  token.startsWith(COMMENT_START) ? ' ' : token;

const getImportUrlLayerIdentifier = (importUrl: string): string =>
  importUrl.replace(/^url\(|\)$|["']/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');

const getNestedImportLayerName = ({
  importUrl,
  layerClause,
  layerName,
}: {
  importUrl: string;
  layerClause?: string;
  layerName?: string;
}): string => {
  if (isNonEmptyString(layerName)) {
    return `${TWENTY_UI_CASCADE_LAYER_NAME}.${layerName.trim()}`;
  }

  if (isDefined(layerClause)) {
    return `${TWENTY_UI_CASCADE_LAYER_NAME}.${ANONYMOUS_IMPORT_LAYER_PREFIX}${getImportUrlLayerIdentifier(importUrl)}`;
  }

  return TWENTY_UI_CASCADE_LAYER_NAME;
};

const findTopLevelTwentyUiLayerBlockRanges = (
  cssText: string,
): CssTextRange[] => {
  const twentyUiLayerBlockRanges: CssTextRange[] = [];
  let blockDepth = 0;
  let twentyUiLayerBlockStartIndex: number | undefined;

  for (const token of cssText.matchAll(BLOCK_TOKEN_PATTERN)) {
    const [tokenText, layerName] = token;
    const tokenIndex = token.index ?? 0;

    if (blockDepth === 0 && layerName === TWENTY_UI_CASCADE_LAYER_NAME) {
      twentyUiLayerBlockStartIndex = tokenIndex;
    }

    if (tokenText === '{' || isDefined(layerName)) {
      blockDepth += 1;
      continue;
    }

    if (tokenText !== '}') {
      continue;
    }

    blockDepth -= 1;

    if (blockDepth === 0 && isDefined(twentyUiLayerBlockStartIndex)) {
      twentyUiLayerBlockRanges.push({
        startIndex: twentyUiLayerBlockStartIndex,
        endIndex: tokenIndex + 1,
      });
      twentyUiLayerBlockStartIndex = undefined;
    }
  }

  return twentyUiLayerBlockRanges;
};

const wrapInTwentyUiLayerBlock = (cssText: string): string =>
  isNonEmptyString(cssText.trim())
    ? `${TWENTY_UI_CASCADE_LAYER_DECLARATION} {\n${cssText}\n}`
    : cssText;

const wrapRulesOutsideTwentyUiLayerBlocks = (cssText: string): string => {
  let layeredCss = '';
  let unlayeredCssStartIndex = 0;

  for (const { startIndex, endIndex } of findTopLevelTwentyUiLayerBlockRanges(
    cssText,
  )) {
    layeredCss += wrapInTwentyUiLayerBlock(
      cssText.slice(unlayeredCssStartIndex, startIndex),
    );
    layeredCss += cssText.slice(startIndex, endIndex);
    unlayeredCssStartIndex = endIndex;
  }

  return (
    layeredCss + wrapInTwentyUiLayerBlock(cssText.slice(unlayeredCssStartIndex))
  );
};

export const wrapCssInTwentyUiCascadeLayer = (cssText: string): string => {
  const leadingStatementsEndIndex = getLeadingStatementsEndIndex({
    cssText,
    startIndex: 0,
  });

  const layeredLeadingStatements = cssText
    .slice(0, leadingStatementsEndIndex)
    .replace(STATEMENT_TOKEN_PATTERN, replaceCommentTokenWithSpace)
    .replace(
      IMPORT_LAYER_PATTERN,
      (
        _importStatement: string,
        importUrl: string,
        layerClause?: string,
        layerName?: string,
      ) =>
        `@import ${importUrl} layer(${getNestedImportLayerName({ importUrl, layerClause, layerName })})`,
    );

  const remainingCss = cssText.slice(leadingStatementsEndIndex);

  return `${layeredLeadingStatements}${wrapRulesOutsideTwentyUiLayerBlocks(remainingCss)}`;
};
