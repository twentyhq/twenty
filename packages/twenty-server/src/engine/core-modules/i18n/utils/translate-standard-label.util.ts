import { isNonEmptyString } from '@sniptt/guards';

import {
  generateMessageId,
  METADATA_LABEL_PLACEHOLDER_PASS_THROUGH,
} from 'twenty-shared/i18n';

import { type MessageIdTranslator } from 'src/engine/metadata-modules/overrides/types/message-id-translator.type';

export const translateStandardLabel = ({
  sourceValue,
  context,
  applicationCatalog,
  i18nInstance,
}: {
  sourceValue: string;
  context?: string;
  applicationCatalog: Record<string, string> | undefined;
  i18nInstance: MessageIdTranslator;
}): string => {
  if (!isNonEmptyString(sourceValue)) {
    return sourceValue ?? '';
  }

  const messageId = generateMessageId(sourceValue, context);
  const catalogTranslation = applicationCatalog?.[messageId];

  if (isNonEmptyString(catalogTranslation)) {
    return catalogTranslation;
  }

  // Twenty writes some labels itself on the entities of every application:
  // system fields (Creation date, Created by), the "Go to {objectLabelPlural}"
  // command and the default record page tabs. An application's catalog rarely
  // carries them, so they fall back to Twenty's own catalog. A label nobody
  // translated there is returned as it is.
  const translatedMessage = i18nInstance._(
    messageId,
    METADATA_LABEL_PLACEHOLDER_PASS_THROUGH,
  );

  return isNonEmptyString(translatedMessage) && translatedMessage !== messageId
    ? translatedMessage
    : sourceValue;
};
