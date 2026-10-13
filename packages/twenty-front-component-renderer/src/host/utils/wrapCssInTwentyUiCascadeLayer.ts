import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { TWENTY_UI_CASCADE_LAYER_NAME } from '@/host/constants/TwentyUiCascadeLayerName';

const TWENTY_UI_CASCADE_LAYER_DECLARATION = `@layer ${TWENTY_UI_CASCADE_LAYER_NAME}`;

const ANONYMOUS_IMPORT_LAYER_NAME = 'anonymous';

const LEADING_STATEMENTS_PATTERN =
  /^(?:\s*(?:\/\*[\s\S]*?\*\/|@(?:charset|import|namespace)\s(?:\([^)]*\)|"[^"]*"|'[^']*'|[^;'"()])*;))*/;

const IMPORT_LAYER_PATTERN =
  /@import\s+(url\([^)]*\)|"[^"]*"|'[^']*')(\s*\blayer\b(?:\(([^)]*)\))?)?/g;

const getNestedImportLayerName = ({
  layerClause,
  layerName,
}: {
  layerClause?: string;
  layerName?: string;
}): string => {
  if (isNonEmptyString(layerName)) {
    return `${TWENTY_UI_CASCADE_LAYER_NAME}.${layerName.trim()}`;
  }

  if (isDefined(layerClause)) {
    return `${TWENTY_UI_CASCADE_LAYER_NAME}.${ANONYMOUS_IMPORT_LAYER_NAME}`;
  }

  return TWENTY_UI_CASCADE_LAYER_NAME;
};

export const wrapCssInTwentyUiCascadeLayer = (cssText: string): string => {
  if (cssText.includes(TWENTY_UI_CASCADE_LAYER_DECLARATION)) {
    return cssText;
  }

  const leadingStatements =
    cssText.match(LEADING_STATEMENTS_PATTERN)?.[0] ?? '';

  const layeredLeadingStatements = leadingStatements.replace(
    IMPORT_LAYER_PATTERN,
    (
      _importStatement: string,
      importUrl: string,
      layerClause?: string,
      layerName?: string,
    ) =>
      `@import ${importUrl} layer(${getNestedImportLayerName({ layerClause, layerName })})`,
  );

  const remainingCss = cssText.slice(leadingStatements.length);

  return `${layeredLeadingStatements}${TWENTY_UI_CASCADE_LAYER_DECLARATION} {\n${remainingCss}\n}`;
};
