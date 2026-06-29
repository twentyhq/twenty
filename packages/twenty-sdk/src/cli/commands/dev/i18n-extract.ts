import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { extractApplicationTranslations } from '@/cli/utilities/i18n/extract-application-translations';
import chalk from 'chalk';
import {
  APP_LOCALES,
  SOURCE_LOCALE,
  type AppLocale,
} from 'twenty-shared/translations';

export type AppI18nExtractOptions = {
  appPath?: string;
  locale?: string;
};

const isSupportedLocale = (locale: string): locale is AppLocale =>
  Object.prototype.hasOwnProperty.call(APP_LOCALES, locale);

export class AppI18nExtractCommand {
  async execute(options: AppI18nExtractOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    let scaffoldLocale: AppLocale | undefined;

    if (options.locale !== undefined) {
      if (
        options.locale === SOURCE_LOCALE ||
        !isSupportedLocale(options.locale)
      ) {
        console.error(
          chalk.red(
            `"${options.locale}" is not a supported target locale. Choose one of: ${Object.keys(
              APP_LOCALES,
            )
              .filter((locale) => locale !== SOURCE_LOCALE)
              .join(', ')}`,
          ),
        );
        process.exit(1);
      }

      scaffoldLocale = options.locale;
    }

    console.log(chalk.blue('Extracting translatable strings...'));

    const manifestResult = await buildAndValidateManifest(appPath);

    if (!manifestResult.success) {
      console.error(chalk.red(manifestResult.errors.join('\n')));
      process.exit(1);
    }

    if (manifestResult.warnings.length > 0) {
      console.warn(chalk.yellow(manifestResult.warnings.join('\n')));
    }

    const { sourceCount, updatedLocaleFiles } =
      await extractApplicationTranslations({
        appPath,
        manifest: manifestResult.manifest,
        scaffoldLocale,
      });

    console.log(
      chalk.green(
        `✓ Extracted ${sourceCount} string${sourceCount === 1 ? '' : 's'} to locales/`,
      ),
    );

    if (updatedLocaleFiles.length > 0) {
      console.log(chalk.gray(`Updated: ${updatedLocaleFiles.join(', ')}`));
    }
  }
}
