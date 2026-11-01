import { isNonEmptyString } from '@sniptt/guards';

import { getTwentyUiCascadeLayerName } from '@/host/utils/getTwentyUiCascadeLayerName';

export const getCssImportRuleInTwentyUiCascadeLayer = (
  cssRule: CSSImportRule,
): string => {
  const layerName = getTwentyUiCascadeLayerName(cssRule.layerName);
  const supportsClause = isNonEmptyString(cssRule.supportsText)
    ? ` supports(${cssRule.supportsText})`
    : '';
  const mediaClause = isNonEmptyString(cssRule.media.mediaText)
    ? ` ${cssRule.media.mediaText}`
    : '';

  return `@import url(${CSS.escape(cssRule.href)}) layer(${layerName})${supportsClause}${mediaClause};`;
};
