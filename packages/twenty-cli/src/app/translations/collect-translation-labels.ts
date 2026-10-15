import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { pathExists, readJson } from '@/app/fs-utils';
import { LOCALES_DIR } from '@/app/translations/constants';
import { type Manifest } from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { collectTranslatableStrings } from '@/app/translations/collect-translatable-strings';
import { flattenLocaleCatalog } from '@/app/translations/locale-catalog-format';

export const collectTranslationLabels = async ({
  manifest,
  appPath,
}: {
  manifest: Manifest;
  appPath: string;
}): Promise<Record<string, string>> => {
  const descriptors = collectTranslatableStrings(manifest);

  const localesDirectory = join(appPath, LOCALES_DIR);
  const localePaths = (await pathExists(localesDirectory))
    ? (await readdir(localesDirectory))
        .filter((name) => name.endsWith('.json'))
        .map((name) => join(localesDirectory, name))
    : [];

  for (const localePath of localePaths) {
    try {
      const catalog: unknown = await readJson(localePath);
      if (!isPlainObject(catalog)) {
        throw new Error('Expected a JSON object');
      }
      descriptors.push(...flattenLocaleCatalog(catalog));
    } catch (error) {
      throw new Error(
        `Could not read translation labels from ${localePath}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
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
