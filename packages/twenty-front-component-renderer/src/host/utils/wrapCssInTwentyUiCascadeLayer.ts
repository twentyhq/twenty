import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CSS_AT_RULE_START_REGEX } from '@/host/constants/CssAtRuleStartRegex';
import { TWENTY_UI_CASCADE_LAYER_NAME } from '@/host/constants/TwentyUiCascadeLayerName';
import { getCssImportRuleInTwentyUiCascadeLayer } from '@/host/utils/getCssImportRuleInTwentyUiCascadeLayer';
import { getTwentyUiCascadeLayerName } from '@/host/utils/getTwentyUiCascadeLayerName';
import { splitCssIntoTopLevelRules } from '@/host/utils/splitCssIntoTopLevelRules';

// Rules are re-emitted as written: CSSOM serialization drops the longhands of
// a var() shorthand when the same rule overrides one of them.
export const wrapCssInTwentyUiCascadeLayer = (cssText: string): string => {
  const parsingDocument = document.implementation.createHTMLDocument('');
  const styleElement = parsingDocument.createElement('style');
  parsingDocument.head.appendChild(styleElement);

  const layeredRules: string[] = [];
  const rulesToWrap: string[] = [];

  const flushRulesToWrap = () => {
    if (!isNonEmptyArray(rulesToWrap)) {
      return;
    }

    layeredRules.push(
      `@layer ${TWENTY_UI_CASCADE_LAYER_NAME} {\n${rulesToWrap.splice(0).join('\n')}\n}`,
    );
  };

  for (const ruleText of splitCssIntoTopLevelRules(cssText)) {
    if (!CSS_AT_RULE_START_REGEX.test(ruleText)) {
      rulesToWrap.push(ruleText);
      continue;
    }

    styleElement.textContent = ruleText;

    const cssRules = styleElement.sheet?.cssRules;

    if (!isDefined(cssRules) || cssRules.length !== 1) {
      continue;
    }

    const cssRule = cssRules[0];

    if (cssRule instanceof CSSImportRule) {
      flushRulesToWrap();
      layeredRules.push(getCssImportRuleInTwentyUiCascadeLayer(cssRule));
      continue;
    }

    if (cssRule instanceof CSSLayerStatementRule) {
      flushRulesToWrap();
      const layerNames = cssRule.nameList.map(getTwentyUiCascadeLayerName);
      layeredRules.push(`@layer ${layerNames.join(', ')};`);
      continue;
    }

    const isTwentyUiLayerBlock =
      cssRule instanceof CSSLayerBlockRule &&
      isNonEmptyString(cssRule.name) &&
      getTwentyUiCascadeLayerName(cssRule.name) === cssRule.name;

    if (cssRule instanceof CSSNamespaceRule || isTwentyUiLayerBlock) {
      flushRulesToWrap();
      layeredRules.push(ruleText);
      continue;
    }

    rulesToWrap.push(ruleText);
  }

  flushRulesToWrap();

  return layeredRules.join('\n');
};
