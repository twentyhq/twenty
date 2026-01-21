import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import { runManifestBuild, type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-build';
import { ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import chalk from 'chalk';

export type AppDevOptions = {
  appPath?: string;
};

type AppDevState = {
  buildResult: ManifestBuildResult | null;
};

export class AppDevCommand {
  private manifestWatcher: ManifestWatcher | null = null;
  private functionsWatcher: FunctionsWatcher | null = null;
  private frontComponentsWatcher: FrontComponentsWatcher | null = null;

  private appPath: string = '';
  private state: AppDevState = {
    buildResult: null,
  };

  async execute(options: AppDevOptions): Promise<void> {
    this.appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('🚀 Starting Twenty Application Development Mode'));
    console.log(chalk.gray(`📁 App Path: ${this.appPath}`));
    console.log('');

    await this.startWatchers();

    this.setupGracefulShutdown();
  }

  private async startWatchers(): Promise<void> {
    const buildResult = await runManifestBuild(this.appPath);

    if (!buildResult.manifest) {
      return;
    }

    this.state.buildResult = buildResult;

    await this.startManifestWatcher();
    await this.startFunctionsWatcher(buildResult);
    await this.startFrontComponentsWatcher(buildResult);
  }

  private async startManifestWatcher(): Promise<void> {
    this.manifestWatcher = new ManifestWatcher({
      appPath: this.appPath,
      callbacks: {
        onBuildSuccess: (result) => {
          this.state.buildResult = result;

          if (this.functionsWatcher?.shouldRestart(result)) {
            this.functionsWatcher.restart(result);
          }

          if (this.frontComponentsWatcher?.shouldRestart(result)) {
            this.frontComponentsWatcher.restart(result);
          }
        },
      },
    });

    await this.manifestWatcher.start();
  }

  private async startFunctionsWatcher(buildResult: ManifestBuildResult): Promise<void> {
    this.functionsWatcher = new FunctionsWatcher({
      appPath: this.appPath,
      buildResult,
    });

    await this.functionsWatcher.start();
  }

  private async startFrontComponentsWatcher(buildResult: ManifestBuildResult): Promise<void> {
    this.frontComponentsWatcher = new FrontComponentsWatcher({
      appPath: this.appPath,
      buildResult,
    });

    await this.frontComponentsWatcher.start();
  }

  private setupGracefulShutdown(): void {
    const shutdown = () => {
      console.log(chalk.yellow('\n🛑 Stopping...'));
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
