import { i18n } from '@lingui/core';
import { generateMessageId } from '@lingui/message-utils/generateMessageId';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const TEMPLATE_VARIABLE_REGEX = /\$\{([^{}]+)\}/g;

export const translateCommandMenuItemTemplate = (
  template: Nullable<string>,
): Nullable<string> => {
  if (!isDefined(template)) {
    return template;
  }

  const expressions: string[] = [];

  const normalizedMessage = template.replace(
    TEMPLATE_VARIABLE_REGEX,
    (match) => {
      expressions.push(match);

      return `{${expressions.length - 1}}`;
    },
  );

  const messageId = generateMessageId(normalizedMessage);

  const translatedMessage = i18n._(
    messageId,
    Object.fromEntries(
      expressions.map((expression, index) => [index, expression]),
    ),
  );

  return translatedMessage === messageId ? template : translatedMessage;
};
