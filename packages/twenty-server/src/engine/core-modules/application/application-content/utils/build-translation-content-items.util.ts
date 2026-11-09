import { type ApplicationContentItemDTO } from 'src/engine/core-modules/application/application-content/dtos/application-content-item.dto';

export const buildTranslationContentItems = (
  messagesByLocale: Partial<Record<string, Record<string, string>>>,
): ApplicationContentItemDTO[] =>
  Object.entries(messagesByLocale).map(([locale, messages]) => ({
    universalIdentifier: locale,
    label: locale,
    count: Object.keys(messages ?? {}).length,
  }));
