import { isNonEmptyString } from '@sniptt/guards';

import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';

export const convertPlainTextToEmailHtml = (text: string): string => {
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  return normalizedText
    .split(/\n\s*\n/)
    .map((paragraph) => {
      return paragraph.trim();
    })
    .filter(isNonEmptyString)
    .map((paragraph) => {
      const formattedParagraph = escapeHtml(paragraph).replace(/\n/g, '<br>');

      return `<p>${formattedParagraph}</p>`;
    })
    .join('');
};
