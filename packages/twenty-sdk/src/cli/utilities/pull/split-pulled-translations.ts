import { collectFrontComponentStrings } from '@/cli/utilities/translations/collect-front-component-strings';
import { collectTranslatableStrings } from '@/cli/utilities/translations/collect-translatable-strings';
import {
  buildLocaleCatalog,
  type LocaleCatalogEntry,
} from '@/cli/utilities/translations/locale-catalog-format';
import { isSupportedLocale } from '@/cli/utilities/translations/is-supported-locale';
import { type MessageDescriptor } from '@/sdk/front-component/translations/message';
import { type Manifest } from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
import { type AppLocale } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

const isLocaleCatalog = (value: unknown): value is Record<string, string> =>
  isDefined(value) &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.values(value).every((translation) => typeof translation === 'string');

export type PulledLocaleCatalog = {
  locale: AppLocale;
  authored: Record<string, string | Record<string, string>>;
  compiled: Record<string, string>;
};

export const splitPulledTranslations = async ({
  manifest,
  frontComponentSourcePaths,
}: {
  manifest: Manifest;
  frontComponentSourcePaths: string[];
}): Promise<PulledLocaleCatalog[]> => {
  const descriptors: MessageDescriptor[] = [
    ...collectTranslatableStrings(manifest),
    ...(await collectFrontComponentStrings(frontComponentSourcePaths)),
  ];
  const descriptorByMessageId = new Map(
    descriptors.map(
      (descriptor) =>
        [
          generateMessageId(descriptor.message, descriptor.context),
          descriptor,
        ] as const,
    ),
  );

  return Object.entries(manifest.translations ?? {})
    .filter(
      (entry): entry is [AppLocale, Record<string, string>] =>
        isSupportedLocale(entry[0]) && isLocaleCatalog(entry[1]),
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([locale, messages]) => {
      const entries: LocaleCatalogEntry[] = [];
      const compiled: Record<string, string> = {};

      for (const [messageId, translation] of Object.entries(messages)) {
        const descriptor = descriptorByMessageId.get(messageId);

        if (isDefined(descriptor)) {
          entries.push({
            message: descriptor.message,
            context: descriptor.context,
            translation,
          });
        } else {
          compiled[messageId] = translation;
        }
      }

      return { locale, authored: buildLocaleCatalog(entries), compiled };
    });
};
