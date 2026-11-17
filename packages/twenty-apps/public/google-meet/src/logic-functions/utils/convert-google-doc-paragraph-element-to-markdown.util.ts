import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type GoogleDocParagraphElement } from 'src/logic-functions/types/google-doc-paragraph-element.type';

type GoogleDocTextRun = NonNullable<GoogleDocParagraphElement['textRun']>;

const wrapTextWithMarker = ({
  text,
  marker,
  isEnabled,
}: {
  text: string;
  marker: string;
  isEnabled: boolean;
}): string => {
  const trimmedText = text.trim();

  if (!isEnabled || !isNonEmptyString(trimmedText)) {
    return text;
  }

  const trimmedTextStart = text.indexOf(trimmedText);

  return `${text.slice(0, trimmedTextStart)}${marker}${trimmedText}${marker}${text.slice(trimmedTextStart + trimmedText.length)}`;
};

const linkText = (text: string, url: string | undefined): string => {
  if (!isNonEmptyString(url) || !isNonEmptyString(text.trim())) {
    return text;
  }

  return `[${text}](${url})`;
};

const convertTextRunToMarkdown = (textRun: GoogleDocTextRun): string => {
  const text = (textRun.content ?? '')
    .replace(/\n/g, '')
    .replace(/\u000b/g, '\n');
  const boldText = wrapTextWithMarker({
    text: linkText(text, textRun.textStyle?.link?.url),
    marker: '**',
    isEnabled: textRun.textStyle?.bold === true,
  });

  return wrapTextWithMarker({
    text: boldText,
    marker: '_',
    isEnabled: textRun.textStyle?.italic === true,
  });
};

export const convertGoogleDocParagraphElementToMarkdown = (
  element: GoogleDocParagraphElement,
): string => {
  if (isDefined(element.textRun)) {
    return convertTextRunToMarkdown(element.textRun);
  }

  const personProperties = element.person?.personProperties;

  if (isDefined(personProperties)) {
    return personProperties.name ?? personProperties.email ?? '';
  }

  const richLinkProperties = element.richLink?.richLinkProperties;

  if (isNonEmptyString(richLinkProperties?.uri)) {
    return `[${richLinkProperties.title ?? richLinkProperties.uri}](${richLinkProperties.uri})`;
  }

  return '';
};
