const CSS_COMMENT_OR_QUOTED_VALUE_REGEX =
  /\/\*[\s\S]*?(?:\*\/|$)|"[^"\n]*"|'[^'\n]*'/g;

export const maskCssCommentsAndQuotedValues = (cssText: string): string =>
  cssText.replace(CSS_COMMENT_OR_QUOTED_VALUE_REGEX, (maskedText) =>
    maskedText.replace(/[^\n]/g, ' '),
  );
