import { copyBaseApplicationProject } from '@/utils/app-template';
import { downloadExample } from '@/utils/download-example';
import { convertToLabel } from '@/utils/convert-to-label';
import { install } from '@/utils/install';
import { tryGitInit } from '@/utils/try-git-init';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import kebabCase from 'lodash.kebabcase';
import * as path from 'path';
import { basename } from 'path';
import { execSync } from 'node:child_process';
import {
  authLogin,
  checkDockerRunning,
  ConfigService,
  DEV_API_KEY,
  getDockerInstallInstructions,
  isDockerInstalled,
  serverStart,
} from 'twenty-sdk/cli';
import { isDefined } from 'twenty-shared/utils';

const CURRENT_EXECUTION_DIRECTORY = process.env.INIT_CWD || process.cwd();
const IMAGE = 'twentycrm/twenty-app-dev:latest';

type CreateAppOptions = {
  directory?: string;
  example?: string;
  name?: string;
  displayName?: string;
  description?: string;
  skipDocker?: boolean;
};

export class CreateAppCommand {
  async execute(options: CreateAppOptions = {}): Promise<void> {
    const { appName, appDisplayName, appDirectory, appDescription } =
      this.getAppInfos(options);

    try {
      const skipDocker = options.skipDocker ?? false;

      if (!skipDocker && !isDockerInstalled()) {
        console.log(chalk.yellow('\n' + getDockerInstallInstructions() + '\n'));
        process.exit(1);
      }

      await this.validateDirectory(appDirectory);

      const totalSteps = skipDocker ? 4 : 6;

      this.logPlan({ appName, appDisplayName, appDescription, appDirectory });

      this.logStep(1, totalSteps, 'Creating project directory');
      await fs.ensureDir(appDirectory);
      this.logDetail(appDirectory);

      this.logStep(2, totalSteps, 'Scaffolding project files');

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

      this.logStep(3, totalSteps, 'Installing dependencies');
      await install(appDirectory, (message) => this.logDetail(message));

      this.logStep(4, totalSteps, 'Initializing Git repository');
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

      let serverUrl: string | undefined;
      let authSucceeded = false;

      if (!skipDocker) {
        this.logStep(5, totalSteps, 'Starting Twenty server');
        const serverResult = await this.ensureDockerServer();

        serverUrl = serverResult.url;

        if (isDefined(serverUrl)) {
          this.logStep(6, totalSteps, 'Authenticating to local instance');
          authSucceeded = await this.authenticateWithDevKey(serverUrl);
        }
      }

      this.logSuccess(appDirectory, serverUrl, authSucceeded);
    } catch (error) {
      console.error(
        chalk.red('\nCreate application failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private getAppInfos(options: CreateAppOptions): {
    appName: string;
    appDisplayName: string;
    appDescription: string;
    appDirectory: string;
  } {
    const appName = (
      options.name ??
      options.directory ??
      options.example ??
      'my-twenty-app'
    ).trim();

    const appDisplayName =
      options.displayName?.trim() || convertToLabel(appName);

    const appDescription = (options.description ?? '').trim();

    const appDirectory = options.directory
      ? path.join(CURRENT_EXECUTION_DIRECTORY, options.directory)
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
      console.log(
        chalk.yellow(
          `\n${error instanceof Error ? error.message : 'Failed to download example.'}`,
        ),
      );
      this.logDetail('Falling back to default template...');

      await fs.emptyDir(appDirectory);

      return false;
    }
  }

  private logPlan({
    appName,
    appDisplayName,
    appDescription,
    appDirectory,
  }: {
    appName: string;
    appDisplayName: string;
    appDescription: string;
    appDirectory: string;
  }): void {
    console.log(chalk.blue('\nCreating Twenty Application\n'));
    console.log(chalk.white(`  Name:           ${appName}`));
    console.log(chalk.white(`  Display name:   ${appDisplayName}`));

    if (appDescription) {
      console.log(chalk.white(`  Description:    ${appDescription}`));
    }

    console.log(chalk.white(`  Directory:      ${appDirectory}`));
    console.log('');
  }

  private logStep(step: number, total: number, title: string): void {
    console.log(
      chalk.blue(`\n[${step}/${total}]`) + chalk.white(` ${title}...`),
    );
  }

  private logDetail(message: string): void {
    console.log(chalk.gray(`      → ${message}`));
  }

  private async ensureDockerServer(): Promise<{ url?: string }> {
    if (!checkDockerRunning()) {
      console.log(
        chalk.yellow(
          '\n  Docker is installed but not running.\n' +
            '  Please start Docker and run this command again.\n',
        ),
      );

      return {};
    }

    this.logDetail('Pulling latest Twenty server image...');

    try {
      execSync(`docker pull ${IMAGE}`, { stdio: 'inherit' });
    } catch {
      this.logDetail(
        'Image pull failed, continuing with cached image if available...',
      );
    }

    const startResult = await serverStart({
      onProgress: (message: string) => this.logDetail(message),
    });

    if (startResult.success) {
      return { url: startResult.data.url };
    }

    console.log(chalk.yellow(`\n  ${startResult.error.message}`));

    return {};
  }

  private async authenticateWithDevKey(serverUrl: string): Promise<boolean> {
    try {
      const result = await authLogin({
        apiKey: DEV_API_KEY,
        apiUrl: serverUrl,
        remote: 'local',
      });

      if (result.success) {
        const configService = new ConfigService();

        await configService.setDefaultRemote('local');
        this.logDetail('Authenticated as tim@apple.dev (development API key)');

        return true;
      }

      console.log(
        chalk.yellow(
          '  Authentication failed. Run `yarn twenty remote add --local` manually.',
        ),
      );

      return false;
    } catch {
      console.log(
        chalk.yellow(
          '  Authentication failed. Run `yarn twenty remote add` manually.',
        ),
      );

      return false;
    }
  }

  private logSuccess(
    appDirectory: string,
    serverUrl: string | undefined,
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
      console.log(chalk.white(`  ${stepNumber}. Connect to a Twenty instance`));
      console.log(chalk.cyan('     yarn twenty remote add\n'));
      stepNumber++;
    }

    console.log(chalk.white(`  ${stepNumber}. Start developing`));
    console.log(chalk.cyan('     yarn twenty dev\n'));
    stepNumber++;

    if (isDefined(serverUrl)) {
      console.log(chalk.white(`  ${stepNumber}. Open your twenty instance`));
      console.log(chalk.cyan(`     ${serverUrl}\n`));
    }

    console.log(
      chalk.gray(
        '  Documentation: https://docs.twenty.com/developers/extend/capabilities/apps',
      ),
    );
  }
}
