import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  generateMessageId,
  METADATA_LABEL_PLACEHOLDER_PASS_THROUGH,
} from 'twenty-shared/i18n';

import { type MessageIdTranslator } from 'src/engine/metadata-modules/utils/message-id-translator.type';

export const translateStandardLabel = ({
  sourceValue,
  context,
  isStandardApp,
  applicationCatalog,
  i18nInstance,
}: {
  sourceValue: string;
  context?: string;
  isStandardApp: boolean;
  applicationCatalog: Record<string, string> | undefined;
  i18nInstance: MessageIdTranslator;
}): string => {
  if (!isNonEmptyString(sourceValue)) {
    return sourceValue ?? '';
  }

  if (!isDefined(applicationCatalog) && !isStandardApp) {
    return sourceValue;
  }

  const messageId = generateMessageId(sourceValue, context);

  if (isDefined(applicationCatalog)) {
    return applicationCatalog[messageId] ?? sourceValue;
  }

  if (isStandardApp) {
    const translatedMessage = i18nInstance._(
      messageId,
      METADATA_LABEL_PLACEHOLDER_PASS_THROUGH,
    );

    return translatedMessage === messageId ? sourceValue : translatedMessage;
  }

  return sourceValue;
};
