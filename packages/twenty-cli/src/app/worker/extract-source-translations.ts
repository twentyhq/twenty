import { join } from 'node:path';

import { getToolingErrorContext } from '@/app/get-tooling-error-context';
import { AppPathError } from '@/app/pull/app-path-error';
import { CliError } from '@/output/cli-error';
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

  try {
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
  } catch (error) {
    if (!(error instanceof CliError) && !(error instanceof AppPathError)) {
      throw error;
    }

    return {
      success: false as const,
      error: {
        code: error instanceof CliError ? error.code : 'APP_PATH_UNAVAILABLE',
        message: error.message,
        ...getToolingErrorContext(error),
      },
      diagnostics: result.diagnostics,
    };
  }
};
