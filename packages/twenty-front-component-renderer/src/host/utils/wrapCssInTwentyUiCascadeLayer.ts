import { TWENTY_UI_CASCADE_LAYER_NAME } from '@/host/constants/TwentyUiCascadeLayerName';

const TWENTY_UI_CASCADE_LAYER_DECLARATION = `@layer ${TWENTY_UI_CASCADE_LAYER_NAME}`;

const LEADING_STATEMENTS_PATTERN =
  /^(?:\s*(?:\/\*[\s\S]*?\*\/|@(?:charset|import|namespace)\s(?:\([^)]*\)|"[^"]*"|'[^']*'|[^;'"()])*;))*/;

const IMPORT_WITHOUT_LAYER_PATTERN =
  /@import\s+(url\([^)]*\)|"[^"]*"|'[^']*')(?!\s*layer\b)/g;

export const wrapCssInTwentyUiCascadeLayer = (cssText: string): string => {
  if (cssText.includes(TWENTY_UI_CASCADE_LAYER_DECLARATION)) {
    return cssText;
  }

  const leadingStatements =
    cssText.match(LEADING_STATEMENTS_PATTERN)?.[0] ?? '';

  const layeredLeadingStatements = leadingStatements.replace(
    IMPORT_WITHOUT_LAYER_PATTERN,
    `@import $1 layer(${TWENTY_UI_CASCADE_LAYER_NAME})`,
  );

  const remainingCss = cssText.slice(leadingStatements.length);

  return `${layeredLeadingStatements}${TWENTY_UI_CASCADE_LAYER_DECLARATION} {\n${remainingCss}\n}`;
};
