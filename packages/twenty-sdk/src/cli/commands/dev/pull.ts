import chalk from 'chalk';
import inquirer from 'inquirer';

import { appPull } from '@/cli/operations/pull';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';

export type AppPullCommandOptions = {
  appPath?: string;
  universalIdentifier?: string;
  force?: boolean;
};

const confirmOverwrite = async (): Promise<boolean> => {
  console.log(
    chalk.yellow(
      '⚠ This directory already contains a Twenty app. Pull will replace its generated sources\n  (objects, fields, views, roles, permission-flags, page-layouts, navigation-menu-items, default-role.ts).',
    ),
  );

  const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
    {
      type: 'confirm',
      name: 'overwrite',
      message: 'Continue and overwrite?',
      default: false,
    },
  ]);

  return overwrite;
};

export class AppPullCommand {
  async execute(options: AppPullCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;
    const remoteName = ConfigService.getActiveRemote();

    console.log(
      chalk.yellow(
        '⚠ This feature is experimental — review the generated files before applying them.\n',
      ),
    );
    console.log(chalk.blue(`Pulling application from ${remoteName}...`));
    console.log(chalk.gray(`App path: ${appPath}\n`));

    const result = await appPull({
      appPath,
      universalIdentifier: options.universalIdentifier,
      force: options.force,
      confirmOverwrite,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    console.log(
      chalk.green(
        `\n✓ Pulled ${result.data.applicationDisplayName} (${result.data.objectCount} object${result.data.objectCount === 1 ? '' : 's'})`,
      ),
    );

    for (const file of result.data.writtenFiles) {
      console.log(chalk.gray(`  ${file}`));
    }

    console.log(
      chalk.gray(`\nManifest: ${result.data.outputDir}/manifest.json`),
    );

    if (result.data.isProjectScaffolded) {
      console.log(chalk.blue(`\nNext: cd ${appPath} && yarn twenty apply`));
    } else {
      console.log(
        chalk.yellow(
          '\n⚠ This directory is not a Twenty app project yet — `yarn twenty plan/apply` need package.json, tsconfig, and installed dependencies.',
        ),
      );
      console.log(
        chalk.blue(
          'Next: create a project with `npx create-twenty-app@latest <name>`, pull into it with `yarn twenty pull -f -u <universalIdentifier>`, then `yarn twenty apply`.',
        ),
      );
    }
  }
}
