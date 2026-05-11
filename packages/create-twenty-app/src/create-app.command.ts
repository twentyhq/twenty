import { copyBaseApplicationProject } from '@/utils/app-template';
import { downloadExample } from '@/utils/download-example';
import { convertToLabel } from '@/utils/convert-to-label';
import { install } from '@/utils/install';
import { tryGitInit } from '@/utils/try-git-init';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import kebabCase from 'lodash.kebabcase';
import * as path from 'path';
import { basename } from 'path';
import {
  authLoginOAuth,
  checkDockerRunning,
  ConfigService,
  containerExists,
  detectLocalServer,
  serverStart,
} from 'twenty-sdk/cli';
import { isDefined } from 'twenty-shared/utils';

const CURRENT_EXECUTION_DIRECTORY = process.env.INIT_CWD || process.cwd();

type CreateAppOptions = {
  directory?: string;
  example?: string;
  name?: string;
  displayName?: string;
  description?: string;
  skipLocalInstance?: boolean;
  yes?: boolean;
};

export class CreateAppCommand {
  private static TOTAL_STEPS = 4;

  async execute(options: CreateAppOptions = {}): Promise<void> {
    const { appName, appDisplayName, appDirectory, appDescription } =
      await this.getAppInfos(options);

    try {
      await this.validateDirectory(appDirectory);

      const confirmed = await this.promptScaffoldConfirmation({
        appName,
        appDisplayName,
        appDescription,
        appDirectory,
        autoConfirm: options.yes,
      });

      if (!confirmed) {
        console.log(chalk.gray('\nScaffolding cancelled.'));
        process.exit(0);
      }

      console.log('');

      this.logStep(1, 'Creating project directory');
      await fs.ensureDir(appDirectory);
      this.logDetail(appDirectory);

      this.logStep(2, 'Scaffolding project files');

      if (options.example) {
        const exampleSucceeded = await this.tryDownloadExample(
          options.example,
          appDirectory,
        );

        if (!exampleSucceeded) {
          await copyBaseApplicationProject({
            appName,
            appDisplayName,
            appDescription,
            appDirectory,
            onProgress: (message) => this.logDetail(message),
          });
        }
      } else {
        await copyBaseApplicationProject({
          appName,
          appDisplayName,
          appDescription,
          appDirectory,
          onProgress: (message) => this.logDetail(message),
        });
      }

      this.logStep(3, 'Installing dependencies');
      await install(appDirectory, (message) => this.logDetail(message));

      this.logStep(4, 'Initializing Git repository');
      const gitInitialized = await tryGitInit(appDirectory);

      if (gitInitialized) {
        this.logDetail('Initialized on branch main');
        this.logDetail('Created initial commit');
      } else {
        this.logDetail(
          'Skipped (Git unavailable, initialization failed, or already in a repository)',
        );
      }

      console.log('');

      let hasLocalServer = false;
      let authSucceeded = false;

      if (!options.skipLocalInstance) {
        const existingServerUrl = await detectLocalServer();

        if (existingServerUrl) {
          hasLocalServer = true;
          authSucceeded = await this.promptConnectToLocal(existingServerUrl);
        } else {
          const shouldStart = await this.shouldStartServer(options.yes);

          if (shouldStart) {
            const startResult = await serverStart({
              onProgress: (message: string) => console.log(chalk.gray(message)),
            });

            if (startResult.success) {
              hasLocalServer = true;
              authSucceeded = await this.promptConnectToLocal(
                startResult.data.url,
              );
            } else {
              console.log(chalk.yellow(`\n${startResult.error.message}`));
            }
          } else {
            this.logServerSkipped();
          }
        }
      }

      this.logSuccess(appDirectory, hasLocalServer, authSucceeded);
    } catch (error) {
      console.error(
        chalk.red('\nCreate application failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async getAppInfos(options: CreateAppOptions): Promise<{
    appName: string;
    appDisplayName: string;
    appDescription: string;
    appDirectory: string;
  }> {
    const { directory } = options;

    const hasName = isDefined(options.name) || isDefined(directory);
    const hasDisplayName = isDefined(options.displayName);
    const hasDescription = isDefined(options.description);
    const hasExample = isDefined(options.example);

    const { name, displayName, description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Application name:',
        when: () => !hasName && !hasExample,
        default: 'my-twenty-app',
        validate: (input) => {
          if (input.length === 0) return 'Application name is required';
          return true;
        },
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Application display name:',
        when: () => !hasDisplayName && !hasExample,
        default: (answers: { name?: string }) => {
          return convertToLabel(
            answers?.name ?? options.name ?? directory ?? '',
          );
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Application description (optional):',
        when: () => !hasDescription && !hasExample,
        default: '',
      },
    ]);

    const appName = (
      options.name ??
      name ??
      directory ??
      options.example ??
      'my-twenty-app'
    ).trim();

    const appDisplayName =
      (options.displayName ?? displayName)?.trim() || convertToLabel(appName);

    const appDescription = (options.description ?? description ?? '').trim();

    const appDirectory = directory
      ? path.join(CURRENT_EXECUTION_DIRECTORY, directory)
      : path.join(CURRENT_EXECUTION_DIRECTORY, kebabCase(appName));

    return { appName, appDisplayName, appDirectory, appDescription };
  }

  private async validateDirectory(appDirectory: string): Promise<void> {
    if (!(await fs.pathExists(appDirectory))) {
      return;
    }

    const files = await fs.readdir(appDirectory);
    if (files.length > 0) {
      throw new Error(
        `Directory ${appDirectory} already exists and is not empty`,
      );
    }
  }

  private async tryDownloadExample(
    example: string,
    appDirectory: string,
  ): Promise<boolean> {
    try {
      await downloadExample(example, appDirectory);

      return true;
    } catch (error) {
      console.error(
        chalk.red(
          `\n${error instanceof Error ? error.message : 'Failed to download example.'}`,
        ),
      );

      const { useTemplate } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useTemplate',
          message: 'Would you like to create a default template app instead?',
          default: true,
        },
      ]);

      if (!useTemplate) {
        process.exit(1);
      }

      // Clean up any partial files from the failed download
      await fs.emptyDir(appDirectory);

      return false;
    }
  }

  private async promptScaffoldConfirmation({
    appName,
    appDisplayName,
    appDescription,
    appDirectory,
    autoConfirm,
  }: {
    appName: string;
    appDisplayName: string;
    appDescription: string;
    appDirectory: string;
    autoConfirm?: boolean;
  }): Promise<boolean> {
    console.log(chalk.blue('\nCreating Twenty Application\n'));
    console.log(chalk.white(`  Name:           ${appName}`));
    console.log(chalk.white(`  Display name:   ${appDisplayName}`));

    if (appDescription) {
      console.log(chalk.white(`  Description:    ${appDescription}`));
    }

    console.log(chalk.white(`  Directory:      ${appDirectory}`));

    console.log(chalk.white('\nThe following steps will be performed:\n'));
    console.log(chalk.gray('  1. Create project directory'));
    console.log(
      chalk.gray(
        '  2. Scaffold project files from base template\n' +
          '     - Copy template files\n' +
          '     - Configure dotfiles (.gitignore, .github)\n' +
          '     - Generate unique application identifiers\n' +
          '     - Update package.json with app name and SDK versions',
      ),
    );
    console.log(chalk.gray('  3. Install dependencies (yarn)'));
    console.log(
      chalk.gray('  4. Initialize Git repository with initial commit'),
    );
    console.log('');

    if (autoConfirm) {
      return true;
    }

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed?',
        default: true,
      },
    ]);

    return proceed;
  }

  private logStep(step: number, title: string): void {
    console.log(
      chalk.blue(`\n[${step}/${CreateAppCommand.TOTAL_STEPS}]`) +
        chalk.white(` ${title}...`),
    );
  }

  private logDetail(message: string): void {
    console.log(chalk.gray(`      → ${message}`));
  }

  private async shouldStartServer(autoConfirm?: boolean): Promise<boolean> {
    console.log(
      chalk.white(
        '\n  A local Twenty instance is required for app development.\n' +
          '  It provides the API and schema your application connects to.\n',
      ),
    );

    if (checkDockerRunning() && containerExists()) {
      if (autoConfirm) {
        return true;
      }

      const { startExisting } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'startExisting',
          message:
            'An existing Twenty server container was found. Would you like to start it?',
          default: true,
        },
      ]);

      return startExisting;
    }

    if (autoConfirm) {
      return true;
    }

    const { startDocker } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'startDocker',
        message:
          'No running Twenty instance found. Would you like to start one using Docker?',
        default: true,
      },
    ]);

    return startDocker;
  }

  private logServerSkipped(): void {
    console.log(
      chalk.gray(
        '\n  To start a Twenty instance later:\n' +
          '     yarn twenty server start\n\n' +
          '  To connect to a remote instance instead:\n' +
          '     yarn twenty remote add\n',
      ),
    );
  }

  private async promptConnectToLocal(serverUrl: string): Promise<boolean> {
    console.log(
      chalk.white(
        '\n  Authentication links your app to a Twenty instance so you can\n' +
          '  sync custom objects, fields, and roles during development.\n' +
          '  This will open a browser window to complete the OAuth flow.\n',
      ),
    );

    const { shouldAuthenticate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldAuthenticate',
        message: `Authenticate to the local Twenty instance (${serverUrl})?`,
        default: true,
      },
    ]);

    if (!shouldAuthenticate) {
      console.log(
        chalk.gray(
          '\n  Authentication skipped. To authenticate later:\n' +
            `     yarn twenty remote add --local\n`,
        ),
      );

      return false;
    }

    await inquirer.prompt([
      {
        type: 'input',
        name: 'confirm',
        message: 'Press Enter to open the browser for authentication...',
      },
    ]);

    try {
      const result = await authLoginOAuth({
        apiUrl: serverUrl,
        remote: 'local',
      });

      if (result.success) {
        const configService = new ConfigService();

        await configService.setDefaultRemote('local');

        return true;
      } else {
        console.log(
          chalk.yellow(
            'Authentication failed. Run `yarn twenty remote add --local` manually.',
          ),
        );

        return false;
      }
    } catch {
      console.log(
        chalk.yellow(
          'Authentication failed. Run `yarn twenty remote add` manually.',
        ),
      );

      return false;
    }
  }

  private logSuccess(
    appDirectory: string,
    hasLocalServer: boolean,
    authSucceeded: boolean,
  ): void {
    const dirName = basename(appDirectory);

    console.log(chalk.green('\n✔ Application created successfully!\n'));
    console.log(chalk.white('  Next steps:\n'));

    let stepNumber = 1;

    console.log(chalk.white(`  ${stepNumber}. Navigate to your project`));
    console.log(chalk.cyan(`     cd ${dirName}\n`));
    stepNumber++;

    if (!authSucceeded) {
      const remoteCommand = hasLocalServer
        ? 'yarn twenty remote add --local'
        : 'yarn twenty remote add';

      console.log(chalk.white(`  ${stepNumber}. Connect to a Twenty instance`));
      console.log(chalk.cyan(`     ${remoteCommand}\n`));
      stepNumber++;
    }

    console.log(chalk.white(`  ${stepNumber}. Start developing`));
    console.log(chalk.cyan('     yarn twenty dev\n'));

    console.log(
      chalk.gray(
        '  Documentation: https://docs.twenty.com/developers/extend/capabilities/apps',
      ),
    );
  }
}
