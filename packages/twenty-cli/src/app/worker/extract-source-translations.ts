import { join } from 'node:path';

import { extractApplicationTranslations } from '@/app/translations/extract-application-translations';
import { parseExtractionLocale } from '@/app/translations/parse-extraction-locale';
import { buildSourceManifest } from '@/app/worker/build-source-manifest';

export const extractSourceTranslations = async ({
  appPath,
  locale,
  signal,
}: {
  appPath: string;
  locale?: string;
  signal: AbortSignal;
}) => {
  const scaffoldLocale = parseExtractionLocale(locale);
  const result = await buildSourceManifest({ appPath, signal });

  if (!result.success) {
    return result;
  }

  const data = await extractApplicationTranslations({
    appPath,
    manifest: result.data.manifest,
    frontComponentSourcePaths: result.data.filePaths.frontComponents.map(
      (relativePath) => join(appPath, relativePath),
    ),
    scaffoldLocale,
    signal,
  });

  return { success: true as const, data, diagnostics: result.diagnostics };
};
