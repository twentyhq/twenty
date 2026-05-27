import { copyBaseApplicationProject } from '@/utils/app-template';
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
import { isDefined, normalizeUrl } from 'twenty-shared/utils';
import {
  getDockerInstallInstructions,
  isDockerInstalled,
} from '@/utils/docker-install';

const CURRENT_EXECUTION_DIRECTORY = process.env.INIT_CWD || process.cwd();
const IMAGE = 'twentycrm/twenty-app-dev:latest';

export type AuthenticationMethod = 'oauth' | 'apiKey';

type CreateAppOptions = {
  directory?: string;
  name?: string;
  displayName?: string;
  description?: string;
  serverUrl?: string;
  authenticationMethod?: AuthenticationMethod;
};

export class CreateAppCommand {
  private stepCounter = 0;
  private totalSteps = 0;

  async execute(options: CreateAppOptions = {}): Promise<void> {
    const { appName, appDisplayName, appDirectory, appDescription } =
      this.getAppInfos(options);

    const serverUrl = options.serverUrl ?? DEV_API_URL;

    const skipLocalInstance = serverUrl !== DEV_API_URL;

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

      await copyBaseApplicationProject({
        appName,
        appDisplayName,
        appDescription,
        appDirectory,
        onProgress: (message) => this.logDetail(message),
      });

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
      let resolvedServerUrl = serverUrl;
      let serverReady = skipLocalInstance;

      if (!skipLocalInstance) {
        this.logNextStep('Starting Twenty server');
        const serverResult = await this.ensureDockerServer(dockerPullPromise);

        if (isDefined(serverResult.url)) {
          resolvedServerUrl = serverResult.url;
          serverReady = true;
        }
      }

      if (serverReady) {
        this.logNextStep('Authenticating');

        authSucceeded = await this.tryExistingAuth(resolvedServerUrl);

        if (authSucceeded) {
          this.logDetail('Reusing existing credentials');
        } else if (authenticationMethod === 'oauth') {
          this.logDetail('Starting OAuth flow');
          authSucceeded = await this.authenticateWithOAuth(resolvedServerUrl);
        } else {
          this.logDetail('Using development API key');
          authSucceeded = await this.authenticateWithDevKey(resolvedServerUrl);
        }
      }

      this.logNextStep('Installing application');

      let syncSucceeded = false;

      if (serverReady && authSucceeded) {
        syncSucceeded = await this.syncApplication(appDirectory);

        if (!syncSucceeded) {
          this.logDetail('Sync failed. Run `yarn twenty dev --once` manually.');
          return;
        }
      } else {
        this.logDetail('Skipped (server or authentication not available)');
      }

      if (syncSucceeded) {
        await this.openMainPage(appDirectory, resolvedServerUrl);
      }

      this.logSuccess(appDirectory, resolvedServerUrl, authSucceeded);
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
    steps += 1; // sync application

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

  private async openMainPage(
    appDirectory: string,
    serverUrl: string,
  ): Promise<void> {
    try {
      const configService = new ConfigService();
      const config = await configService.getConfig();
      const token = config.twentyCLIAccessToken ?? config.apiKey;

      if (!token) {
        return;
      }

      const [universalIdentifier, frontUrl] = await Promise.all([
        this.readMainPageLayoutUniversalIdentifier(appDirectory),
        this.resolveWorkspaceFrontUrl(serverUrl, token),
      ]);

      if (!universalIdentifier || !frontUrl) {
        return;
      }

      const pageLayoutId = await this.resolvePageLayoutId(
        serverUrl,
        universalIdentifier,
        token,
      );

      if (!pageLayoutId) {
        return;
      }

      const url = `${frontUrl}/page/${pageLayoutId}`;

      this.logDetail(`Opening app welcome page: ${url}`);
      this.openInBrowser(url);
    } catch {
      // Best-effort — don't fail the scaffold if browser open fails
    }
  }

  private async resolveWorkspaceFrontUrl(
    serverUrl: string,
    token: string,
  ): Promise<string | null> {
    const query = `{ currentWorkspace { workspaceUrls { subdomainUrl customUrl } } }`;

    const response = await fetch(`${serverUrl}/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as {
      data?: {
        currentWorkspace?: {
          workspaceUrls?: { subdomainUrl?: string; customUrl?: string };
        };
      };
    };

    const urls = body.data?.currentWorkspace?.workspaceUrls;

    if (!urls) {
      return null;
    }

    const frontUrl = urls.customUrl ?? urls.subdomainUrl;

    return frontUrl ? normalizeUrl(frontUrl) : null;
  }

  private async readMainPageLayoutUniversalIdentifier(
    appDirectory: string,
  ): Promise<string | null> {
    const filePath = path.join(
      appDirectory,
      'src',
      'constants',
      'universal-identifiers.ts',
    );
    const content = await fs.readFile(filePath, 'utf-8');
    const match = content.match(
      /MAIN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER\s*=\s*'([^']+)'/,
    );

    return match?.[1] ?? null;
  }

  private async resolvePageLayoutId(
    serverUrl: string,
    universalIdentifier: string,
    token: string,
  ): Promise<string | null> {
    const query = `{ getPageLayouts { id universalIdentifier } }`;

    const response = await fetch(`${serverUrl}/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as {
      data?: {
        getPageLayouts?: { id: string; universalIdentifier: string }[];
      };
    };

    const matching = body.data?.getPageLayouts?.find(
      (layout) => layout.universalIdentifier === universalIdentifier,
    );

    return matching?.id ?? null;
  }

  private sanitizeBrowserUrl(url: string): string | null {
    if (/[^\u0020-\u007E]/.test(url)) {
      return null;
    }

    try {
      const parsed = new URL(url);

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }

      return parsed.toString();
    } catch {
      return null;
    }
  }

  private openInBrowser(url: string): void {
    const safeUrl = this.sanitizeBrowserUrl(url);

    if (!safeUrl) {
      return;
    }

    const isWindows = process.platform === 'win32';
    const command = isWindows
      ? 'rundll32'
      : process.platform === 'darwin'
        ? 'open'
        : 'xdg-open';
    const args = isWindows
      ? ['url.dll,FileProtocolHandler', safeUrl]
      : [safeUrl];

    const child = spawn(command, args, {
      stdio: 'ignore',
      detached: !isWindows,
    });
    child.on('error', () => undefined);
    if (!isWindows) {
      child.unref();
    }
  }

  private async syncApplication(appDirectory: string): Promise<boolean> {
    this.logDetail('Running `yarn twenty dev --once`...');
    return new Promise((resolve) => {
      const child = spawn('yarn', ['twenty', 'dev', '--once'], {
        cwd: appDirectory,
        stdio: ['inherit', 'pipe', 'pipe'],
      });

      child.stdout?.resume();
      child.stderr?.resume();

      child.on('close', (code) => resolve(code === 0));
      child.on('error', () => resolve(false));
    });
  }

  private async tryExistingAuth(serverUrl: string): Promise<boolean> {
    try {
      const configService = new ConfigService();
      const remoteNames = await configService.getRemotes();

      for (const remoteName of remoteNames) {
        const remoteConfig = await configService.getConfigForRemote(remoteName);

        if (remoteConfig.apiUrl !== serverUrl) {
          continue;
        }

        const token = remoteConfig.twentyCLIAccessToken ?? remoteConfig.apiKey;

        if (!token) {
          continue;
        }

        const response = await fetch(`${serverUrl}/metadata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: '{ currentWorkspace { id } }',
          }),
        });

        if (!response.ok) {
          continue;
        }

        const body = (await response.json()) as {
          data?: { currentWorkspace?: { id: string } };
          errors?: unknown[];
        };

        if (isDefined(body.data?.currentWorkspace) && !body.errors) {
          ConfigService.setActiveRemote(remoteName);
          await configService.setDefaultRemote(remoteName);

          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
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
          '  Authentication failed. Run `yarn twenty remote:add --local` manually.',
        ),
      );

      return false;
    } catch {
      console.log(
        chalk.yellow(
          '  Authentication failed. Run `yarn twenty remote:add --local` manually.',
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

  private async authenticateWithOAuth(serverUrl: string): Promise<boolean> {
    try {
      const remoteName = this.deriveRemoteName(serverUrl);

      ConfigService.setActiveRemote(remoteName);

      this.logDetail('Opening browser for OAuth...');

      const result = await authLoginOAuth({ apiUrl: serverUrl });

      if (result.success) {
        const configService = new ConfigService();

        await configService.setDefaultRemote(remoteName);
        this.logDetail(`Authenticated via OAuth to ${serverUrl}`);

        return true;
      }

      console.log(
        chalk.yellow(
          `  OAuth failed: ${result.error.message}\n` +
            `  Run \`yarn twenty remote:add --url ${serverUrl}\` manually.`,
        ),
      );

      return false;
    } catch {
      console.log(
        chalk.yellow(
          `  Authentication failed. Run \`yarn twenty remote:add --url ${serverUrl}\` manually.`,
        ),
      );

      return false;
    }
  }

  private logSuccess(
    appDirectory: string,
    serverUrl: string,
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
        chalk.cyan('     yarn twenty remote:add --url <your-instance-url>\n'),
      );
      stepNumber++;
    }

    console.log(chalk.white(`  ${stepNumber}. Start developing`));
    console.log(chalk.cyan('     yarn twenty dev\n'));
    stepNumber++;

    console.log(chalk.white(`  ${stepNumber}. Open your twenty instance`));
    console.log(chalk.cyan(`     ${serverUrl}\n`));

    console.log(
      chalk.gray(
        '  Documentation: https://docs.twenty.com/developers/extend/capabilities/apps',
      ),
    );
  }
}
