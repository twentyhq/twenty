import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'twenty-shared/i18n';

import { type MessageIdTranslator } from 'src/engine/metadata-modules/utils/message-id-translator.type';

export const translateStandardLabel = ({
  sourceValue,
  isStandardApp,
  applicationCatalog,
  i18nInstance,
}: {
  sourceValue: string;
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

  const messageId = generateMessageId(sourceValue);

  if (isDefined(applicationCatalog)) {
    return applicationCatalog[messageId] ?? sourceValue;
  }

  if (isStandardApp) {
    const translatedMessage = i18nInstance._(messageId);

    return translatedMessage === messageId ? sourceValue : translatedMessage;
  }

  return sourceValue;
};
