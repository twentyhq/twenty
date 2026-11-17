import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type GoogleDocMarkdownSegment } from 'src/logic-functions/types/google-doc-markdown-segment.type';
import { type GoogleDocParagraphElement } from 'src/logic-functions/types/google-doc-paragraph-element.type';
import { escapeMarkdownText } from 'src/logic-functions/utils/escape-markdown-text.util';
import { splitSurroundingWhitespace } from 'src/logic-functions/utils/split-surrounding-whitespace.util';

const linkMarkdownText = ({
  text,
  url,
}: {
  text: string;
  url: string | undefined;
}): string => {
  const { leading, content, trailing } = splitSurroundingWhitespace(text);

  if (!isNonEmptyString(url) || !isNonEmptyString(content)) {
    return text;
  }

  return `${leading}[${content}](${url})${trailing}`;
};

export const buildGoogleDocMarkdownSegment = (
  element: GoogleDocParagraphElement,
): GoogleDocMarkdownSegment => {
  if (isDefined(element.textRun)) {
    const { content, textStyle } = element.textRun;

    return {
      markdown: linkMarkdownText({
        text: escapeMarkdownText(
          (content ?? '').replace(/\n/g, '').replace(/\u000b/g, '\n'),
        ),
        url: textStyle?.link?.url,
      }),
      isBold: textStyle?.bold,
      isItalic: textStyle?.italic,
    };
  }

  const personProperties = element.person?.personProperties;

  if (isDefined(personProperties)) {
    return {
      markdown: escapeMarkdownText(
        personProperties.name ?? personProperties.email ?? '',
      ),
    };
  }

  const richLinkProperties = element.richLink?.richLinkProperties;

  if (isNonEmptyString(richLinkProperties?.uri)) {
    return {
      markdown: linkMarkdownText({
        text: escapeMarkdownText(
          richLinkProperties.title ?? richLinkProperties.uri,
        ),
        url: richLinkProperties.uri,
      }),
    };
  }

  return { markdown: '' };
};
