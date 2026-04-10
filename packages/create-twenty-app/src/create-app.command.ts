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
  ConfigService,
  detectLocalServer,
  serverStart,
  type ServerStartResult,
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
};

export class CreateAppCommand {
  async execute(options: CreateAppOptions = {}): Promise<void> {
    const { appName, appDisplayName, appDirectory, appDescription } =
      await this.getAppInfos(options);

    try {
      await this.validateDirectory(appDirectory);

      this.logCreationInfo({ appDirectory, appName });

      await fs.ensureDir(appDirectory);

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
          });
        }
      } else {
        await copyBaseApplicationProject({
          appName,
          appDisplayName,
          appDescription,
          appDirectory,
        });
      }

      await install(appDirectory);

      await tryGitInit(appDirectory);

      let serverResult: ServerStartResult | undefined;

      if (!options.skipLocalInstance) {
        const shouldStartServer = await this.shouldStartServer();

        if (shouldStartServer) {
          const startResult = await serverStart({
            onProgress: (message: string) => console.log(chalk.gray(message)),
          });

          if (startResult.success) {
            serverResult = startResult.data;
            await this.promptConnectToLocal(serverResult.url);
          } else {
            console.log(chalk.yellow(`\n${startResult.error.message}`));
          }
        }
      }

      this.logSuccess(appDirectory, serverResult);
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

  private logCreationInfo({
    appDirectory,
    appName,
  }: {
    appDirectory: string;
    appName: string;
  }): void {
    console.log(
      chalk.blue('\n', 'Creating Twenty Application\n'),
      chalk.gray(`- Directory: ${appDirectory}\n`, `- Name: ${appName}\n`),
    );
  }

  private async shouldStartServer(): Promise<boolean> {
    const existingServerUrl = await detectLocalServer();

    if (existingServerUrl) {
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

  private async promptConnectToLocal(serverUrl: string): Promise<void> {
    const { shouldAuthenticate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldAuthenticate',
        message: `Would you like to authenticate to the local Twenty instance (${serverUrl})?`,
        default: true,
      },
    ]);

    if (!shouldAuthenticate) {
      console.log(
        chalk.gray(
          'Authentication skipped. Run `yarn twenty remote add --local` manually.',
        ),
      );

      return;
    }

    try {
      const result = await authLoginOAuth({
        apiUrl: serverUrl,
        remote: 'local',
      });

      if (result.success) {
        const configService = new ConfigService();

        await configService.setDefaultRemote('local');
      } else {
        console.log(
          chalk.yellow(
            'Authentication failed. Run `yarn twenty remote add --local` manually.',
          ),
        );
      }
    } catch {
      console.log(
        chalk.yellow(
          'Authentication failed. Run `yarn twenty remote add` manually.',
        ),
      );
    }
  }

  private logSuccess(
    appDirectory: string,
    serverResult?: ServerStartResult,
  ): void {
    const dirName = basename(appDirectory);

    console.log(chalk.blue('\nApplication created. Next steps:'));
    console.log(chalk.gray(`- cd ${dirName}`));

    if (!serverResult) {
      console.log(
        chalk.gray(
          '- yarn twenty remote add          # Authenticate with Twenty',
        ),
      );
    }

    console.log(
      chalk.gray('- yarn twenty dev                  # Start dev mode'),
    );
  }
}
