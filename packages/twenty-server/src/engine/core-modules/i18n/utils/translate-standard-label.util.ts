import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from '@lingui/message-utils/generateMessageId';

import {
  generateApplicationMessageId,
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

  // The two catalogs are two key spaces. An application catalog was keyed by
  // the SDK at publish time with our frozen wire format; the standard catalog
  // was keyed by `lingui compile`, so it has to be asked in Lingui's own ids.
  if (isDefined(applicationCatalog)) {
    return (
      applicationCatalog[generateApplicationMessageId(sourceValue, context)] ??
      sourceValue
    );
  }

  if (isStandardApp) {
    const messageId = generateMessageId(sourceValue, context);
    const translatedMessage = i18nInstance._(
      messageId,
      METADATA_LABEL_PLACEHOLDER_PASS_THROUGH,
    );

    return translatedMessage === messageId ? sourceValue : translatedMessage;
  }

  return sourceValue;
};
