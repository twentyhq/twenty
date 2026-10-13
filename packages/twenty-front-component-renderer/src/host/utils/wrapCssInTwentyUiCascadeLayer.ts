import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { TWENTY_UI_CASCADE_LAYER_NAME } from '@/host/constants/TwentyUiCascadeLayerName';

const TWENTY_UI_CASCADE_LAYER_DECLARATION = `@layer ${TWENTY_UI_CASCADE_LAYER_NAME}`;

const ANONYMOUS_IMPORT_LAYER_PREFIX = 'anonymous-';

const COMMENT_START = '/*';

const LEADING_COMMENT_PATTERN = /^\s*\/\*[\s\S]*?\*\//;

const LEADING_TOP_LEVEL_AT_RULE_PATTERN = /^\s*@(?:charset|import|namespace)\b/;

const STATEMENT_TOKEN_PATTERN =
  /\/\*[\s\S]*?(?:\*\/|$)|"[^"]*"|'[^']*'|[();{]/g;

const IMPORT_LAYER_PATTERN =
  /@import\s+(url\([^)]*\)|"[^"]*"|'[^']*')(\s*\blayer\b(?:\(([^)]*)\))?)?/g;

const findStatementEndIndex = (
  cssText: string,
  startIndex: number,
): number | undefined => {
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

const getLeadingStatementsEndIndex = (
  cssText: string,
  startIndex = 0,
): number => {
  const remainingCss = cssText.slice(startIndex);
  const leadingComment = remainingCss.match(LEADING_COMMENT_PATTERN)?.[0];

  if (isDefined(leadingComment)) {
    return getLeadingStatementsEndIndex(
      cssText,
      startIndex + leadingComment.length,
    );
  }

  if (!LEADING_TOP_LEVEL_AT_RULE_PATTERN.test(remainingCss)) {
    return startIndex;
  }

  const statementEndIndex = findStatementEndIndex(cssText, startIndex);

  return isDefined(statementEndIndex)
    ? getLeadingStatementsEndIndex(cssText, statementEndIndex + 1)
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

export const wrapCssInTwentyUiCascadeLayer = (cssText: string): string => {
  if (cssText.includes(TWENTY_UI_CASCADE_LAYER_DECLARATION)) {
    return cssText;
  }

  const leadingStatementsEndIndex = getLeadingStatementsEndIndex(cssText);

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

  return `${layeredLeadingStatements}${TWENTY_UI_CASCADE_LAYER_DECLARATION} {\n${remainingCss}\n}`;
};
