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
import { spawn } from 'node:child_process';
import {
  authLogin,
  authLoginOAuth,
  checkDockerRunning,
  ConfigService,
  DEV_API_KEY,
  DEV_API_URL,
  serverStart,
} from 'twenty-sdk/cli';
import { isDefined } from 'twenty-shared/utils';
import {
  getDockerInstallInstructions,
  isDockerInstalled,
} from '@/utils/docker-install';

const CURRENT_EXECUTION_DIRECTORY = process.env.INIT_CWD || process.cwd();
const IMAGE = 'twentycrm/twenty-app-dev:latest';

export type AuthenticationMethod = 'oauth' | 'apiKey';

type CreateAppOptions = {
  directory?: string;
  example?: string;
  name?: string;
  displayName?: string;
  description?: string;
  apiUrl?: string;
  authenticationMethod?: AuthenticationMethod;
};

export class CreateAppCommand {
  private stepCounter = 0;
  private totalSteps = 0;

  async execute(options: CreateAppOptions = {}): Promise<void> {
    const { appName, appDisplayName, appDirectory, appDescription } =
      this.getAppInfos(options);

    const apiUrl = options.apiUrl ?? DEV_API_URL;

    const skipLocalInstance = apiUrl !== DEV_API_URL;

    if (!skipLocalInstance && !isDockerInstalled()) {
      console.log(chalk.yellow('\n' + getDockerInstallInstructions() + '\n'));
      process.exit(1);
    }

    if (skipLocalInstance && options.authenticationMethod === 'apiKey') {
      console.log(
        chalk.yellow(
          'API key authentication is only supported on a local Docker instance. Ignoring and switching to OAuth authentication.',
        ),
      );
    }

    const authenticationMethod = skipLocalInstance
      ? 'oauth'
      : (options.authenticationMethod ?? 'apiKey');

    try {
      await this.validateDirectory(appDirectory);

      this.totalSteps = this.computeTotalSteps({
        skipLocalInstance,
      });

      this.stepCounter = 0;

      const dockerPullPromise =
        !skipLocalInstance && checkDockerRunning()
          ? this.pullImageInBackground()
          : Promise.resolve(false);

      this.logPlan({ appName, appDisplayName, appDescription, appDirectory });

      this.logNextStep('Creating project directory');

      await fs.ensureDir(appDirectory);

      this.logDetail(appDirectory);

      this.logNextStep('Scaffolding project files');

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

      this.logNextStep('Installing dependencies');

      await install(appDirectory, (message) => this.logDetail(message));

      this.logNextStep('Initializing Git repository');

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

      let authSucceeded = false;
      let resolvedApiUrl = apiUrl;
      let serverReady = skipLocalInstance;

      if (!skipLocalInstance) {
        this.logNextStep('Starting Twenty server');
        const serverResult = await this.ensureDockerServer(dockerPullPromise);

        if (isDefined(serverResult.url)) {
          resolvedApiUrl = serverResult.url;
          serverReady = true;
        }
      }

      if (serverReady && authenticationMethod === 'oauth') {
        this.logNextStep('Authenticating via OAuth');
        authSucceeded = await this.authenticateWithOAuth(resolvedApiUrl);
      } else if (serverReady && authenticationMethod === 'apiKey') {
        this.logNextStep('Authenticating via API key');
        authSucceeded = await this.authenticateWithDevKey(resolvedApiUrl);
      }

      this.logSuccess(appDirectory, resolvedApiUrl, authSucceeded);
    } catch (error) {
      console.error(
        chalk.red('\nCreate application failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private computeTotalSteps({
    skipLocalInstance,
  }: {
    skipLocalInstance: boolean;
  }): number {
    let steps = 4; // directory, scaffold, install, git

    if (!skipLocalInstance) {
      steps += 1; // start server
    }

    steps += 1; // authenticate (oauth or apiKey)

    return steps;
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

  private logNextStep(title: string): void {
    this.stepCounter++;
    console.log(
      chalk.blue(`\n[${this.stepCounter}/${this.totalSteps}]`) +
        chalk.white(` ${title}...`),
    );
  }

  private logDetail(message: string): void {
    console.log(chalk.gray(`      → ${message}`));
  }

  private pullImageInBackground(): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn('docker', ['pull', IMAGE], { stdio: 'ignore' });

      child.on('close', (code) => resolve(code === 0));
      child.on('error', () => resolve(false));
    });
  }

  private async ensureDockerServer(
    dockerPullPromise: Promise<boolean>,
  ): Promise<{ url?: string }> {
    if (!checkDockerRunning()) {
      console.log(
        chalk.yellow(
          '\n  Docker is installed but not running.\n' +
            '  Please start Docker and run this command again.\n',
        ),
      );

      return {};
    }

    this.logDetail('Ensuring latest Twenty server image...');

    const pullSucceeded = await dockerPullPromise;

    if (!pullSucceeded) {
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

  private async authenticateWithDevKey(apiUrl: string): Promise<boolean> {
    try {
      const result = await authLogin({
        apiKey: DEV_API_KEY,
        apiUrl,
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
          '  Authentication failed. Run `yarn twenty remote add --local` manually.',
        ),
      );

      return false;
    }
  }

  private deriveRemoteName(url: string): string {
    try {
      return new URL(url).hostname.replace(/\./g, '-');
    } catch {
      return 'remote';
    }
  }

  private async authenticateWithOAuth(apiUrl: string): Promise<boolean> {
    try {
      const remoteName = this.deriveRemoteName(apiUrl);

      ConfigService.setActiveRemote(remoteName);

      this.logDetail('Opening browser for OAuth...');

      const result = await authLoginOAuth({ apiUrl });

      if (result.success) {
        const configService = new ConfigService();

        await configService.setDefaultRemote(remoteName);
        this.logDetail(`Authenticated via OAuth to ${apiUrl}`);

        return true;
      }

      console.log(
        chalk.yellow(
          `  OAuth failed: ${result.error.message}\n` +
            `  Run \`yarn twenty remote add --api-url ${apiUrl}\` manually.`,
        ),
      );

      return false;
    } catch {
      console.log(
        chalk.yellow(
          `  Authentication failed. Run \`yarn twenty remote add --api-url ${apiUrl}\` manually.`,
        ),
      );

      return false;
    }
  }

  private logSuccess(
    appDirectory: string,
    apiUrl: string,
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
      console.log(
        chalk.cyan(
          '     yarn twenty remote add --api-url <your-instance-url>\n',
        ),
      );
      stepNumber++;
    }

    console.log(chalk.white(`  ${stepNumber}. Start developing`));
    console.log(chalk.cyan('     yarn twenty dev\n'));
    stepNumber++;

    console.log(chalk.white(`  ${stepNumber}. Open your twenty instance`));
    console.log(chalk.cyan(`     ${apiUrl}\n`));

    console.log(
      chalk.gray(
        '  Documentation: https://docs.twenty.com/developers/extend/capabilities/apps',
      ),
    );
  }
}
