import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { pathExists } from '@/app/fs-utils';
import { LOCALES_DIR } from '@/app/translations/constants';
import { type Manifest } from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { collectTranslatableStrings } from '@/app/translations/collect-translatable-strings';
import { flattenLocaleCatalog } from '@/app/translations/locale-catalog-format';
import { readLocaleCatalogFile } from '@/app/translations/read-locale-catalog-file';

export const collectTranslationLabels = async ({
  manifest,
  appPath,
  onWarning = (message) => console.warn(message),
}: {
  manifest: Manifest;
  appPath: string;
  onWarning?: (message: string) => void;
}): Promise<Record<string, string>> => {
  const descriptors = collectTranslatableStrings(manifest);

  const localesDirectory = join(appPath, LOCALES_DIR);
  const localePaths = (await pathExists(localesDirectory))
    ? (await readdir(localesDirectory))
        .filter((name) => name.endsWith('.json'))
        .map((name) => join(localesDirectory, name))
    : [];

  for (const localePath of localePaths) {
    const catalog = await readLocaleCatalogFile({
      filePath: localePath,
      onWarning,
    });
    if (!isDefined(catalog)) {
      continue;
    }
    descriptors.push(...flattenLocaleCatalog(catalog));
  }

  return Object.fromEntries(
    descriptors.map(({ message, context }) => [
      generateMessageId(message, context),
      isDefined(context)
        ? `${context}[${JSON.stringify(message)}]`
        : JSON.stringify(message),
    ]),
  );
};
