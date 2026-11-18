import { isNonEmptyString } from '@sniptt/guards';
import { escapeText } from 'entities';

import {
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  type EmailDocument,
  isVariableReference,
  TIPTAP_NODE_TYPES,
} from 'twenty-shared/utils';
import { isStandaloneVariableString } from 'twenty-shared/workflow';

import { looksLikeHtml } from 'src/database/commands/upgrade-version-command/2-47/utils/looks-like-html.util';

const VARIABLE_TOKEN_PATTERN = /({{[^{}]+}})/;

const buildEmailDocument = (
  content: EmailDocument['content'],
): EmailDocument => ({
  type: TIPTAP_NODE_TYPES.DOCUMENT,
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content,
});

const wrapInRawHtmlBlock = (html: string): EmailDocument =>
  buildEmailDocument([
    { type: TIPTAP_NODE_TYPES.HTML_DOCUMENT, attrs: { html } },
  ]);

export const convertStringBodyToEmailDocument = (
  body: string,
): EmailDocument => {
  const trimmedBody = body.trim();

  if (!isNonEmptyString(trimmedBody)) {
    return buildEmailDocument([]);
  }

  if (looksLikeHtml(body) || isStandaloneVariableString(trimmedBody)) {
    return wrapInRawHtmlBlock(body);
  }

  const plainText = body.replace(/\r\n?/g, '\n');
  const variableValuesMayContainHtml = isVariableReference(body);

  if (variableValuesMayContainHtml) {
    const escapedText = plainText
      .split(VARIABLE_TOKEN_PATTERN)
      .map((textOrVariable) =>
        isStandaloneVariableString(textOrVariable)
          ? textOrVariable
          : escapeText(textOrVariable),
      )
      .join('');

    return wrapInRawHtmlBlock(escapedText.replace(/\n/g, '<br>'));
  }

  const paragraphContent = plainText
    .split('\n')
    .flatMap((line, lineIndex) => [
      ...(lineIndex > 0 ? [{ type: TIPTAP_NODE_TYPES.HARD_BREAK }] : []),
      ...(isNonEmptyString(line)
        ? [{ type: TIPTAP_NODE_TYPES.TEXT, text: line }]
        : []),
    ]);

  return buildEmailDocument([
    { type: TIPTAP_NODE_TYPES.PARAGRAPH, content: paragraphContent },
  ]);
};
