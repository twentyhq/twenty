import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { extractApplicationTranslations } from '@/cli/utilities/i18n/extract-application-translations';
import chalk from 'chalk';

export type AppI18nExtractOptions = {
  appPath?: string;
};

export class AppI18nExtractCommand {
  async execute(options: AppI18nExtractOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('Extracting translatable strings...'));

    const manifestResult = await buildAndValidateManifest(appPath);

    if (!manifestResult.success) {
      console.log(chalk.red(manifestResult.errors.join('\n')));
      process.exit(1);
    }

    const { sourceCount, updatedLocaleFiles } =
      await extractApplicationTranslations({
        appPath,
        manifest: manifestResult.manifest,
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
