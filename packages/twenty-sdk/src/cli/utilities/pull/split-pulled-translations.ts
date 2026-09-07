import { collectFrontComponentStrings } from '@/cli/utilities/translations/collect-front-component-strings';
import { collectTranslatableStrings } from '@/cli/utilities/translations/collect-translatable-strings';
import {
  buildLocaleCatalog,
  type LocaleCatalogEntry,
} from '@/cli/utilities/translations/locale-catalog-format';
import { type MessageDescriptor } from '@/sdk/front-component/translations/message';
import { type Manifest } from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

export type PulledLocaleCatalog = {
  locale: string;
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
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([locale, messages]) => {
      const entries: LocaleCatalogEntry[] = [];
      const compiled: Record<string, string> = {};

      for (const [messageId, translation] of Object.entries(messages ?? {})) {
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
