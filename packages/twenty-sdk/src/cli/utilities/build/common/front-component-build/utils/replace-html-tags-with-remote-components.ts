import { isDefined } from 'twenty-shared/utils';

import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '../../../../../../sdk/front-component-api/constants/HtmlTagToRemoteComponent';

const buildHtmlTagPattern = (): RegExp => {
  const supportedHtmlTagNames = Object.keys(
    HTML_TAG_TO_CUSTOM_ELEMENT_TAG,
  ).join('|');

  return new RegExp(
    `(<\\/?)\\b(${supportedHtmlTagNames})\\b(?=[\\s>\\/>])`,
    'g',
  );
};

const HTML_TAG_PATTERN = buildHtmlTagPattern();

// Replaces standard HTML tags (<div>, <span>, …) in TSX source with
// their custom element equivalents (<html-div>, <html-span>, …) so
// React creates remote DOM elements instead of standard HTML elements.
export const replaceHtmlTagsWithRemoteComponents = (
  sourceCode: string,
): string => {
  return sourceCode.replace(
    HTML_TAG_PATTERN,
    (fullMatch, tagPrefix: string, htmlTagName: string) => {
      const customElementTag =
        HTML_TAG_TO_CUSTOM_ELEMENT_TAG[
          htmlTagName as keyof typeof HTML_TAG_TO_CUSTOM_ELEMENT_TAG
        ];

      if (isDefined(customElementTag)) {
        return `${tagPrefix}${customElementTag}`;
      }

      return fullMatch;
    },
  );
};
