import { createFrontComponentsWatcher, type FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { createFunctionsWatcher, type FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import { runManifestBuild } from '@/cli/utilities/build/manifest/manifest-build';
import { createManifestWatcher, type ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import chalk from 'chalk';
import { type ApplicationManifest } from 'twenty-shared/application';

export type AppDevOptions = {
  appPath?: string;
};

type AppDevState = {
  manifest: ApplicationManifest | null;
};

export class AppDevCommand {
  private manifestWatcher: ManifestWatcher | null = null;
  private functionsWatcher: FunctionsWatcher | null = null;
  private frontComponentsWatcher: FrontComponentsWatcher | null = null;

  private appPath: string = '';
  private state: AppDevState = {
    manifest: null,
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
    const manifest = await runManifestBuild(this.appPath);

    if (!manifest) {
      return;
    }

    this.state.manifest = manifest;

    await this.startManifestWatcher();
    await this.startFunctionsWatcher(manifest);
    await this.startFrontComponentsWatcher(manifest);
  }

  private async startManifestWatcher(): Promise<void> {
    this.manifestWatcher = await createManifestWatcher({
      appPath: this.appPath,
      callbacks: {
        onBuildSuccess: (manifest) => {
          this.state.manifest = manifest;

          if (manifest.serverlessFunctions.length > 0) {
            this.functionsWatcher?.restart(manifest);
          }

          if (manifest.frontComponents && manifest.frontComponents.length > 0) {
            this.frontComponentsWatcher?.restart(manifest);
          }
        },
      },
    });
  }

  private async startFunctionsWatcher(manifest: ApplicationManifest): Promise<void> {
    this.functionsWatcher = await createFunctionsWatcher({
      appPath: this.appPath,
      manifest,
    });
  }

  private async startFrontComponentsWatcher(manifest: ApplicationManifest): Promise<void> {
    this.frontComponentsWatcher = await createFrontComponentsWatcher({
      appPath: this.appPath,
      manifest,
    });
  }

  private setupGracefulShutdown(): void {
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n🛑 Stopping development mode...'));

      const closePromises: Promise<void>[] = [];

      if (this.manifestWatcher) {
        closePromises.push(this.manifestWatcher.close());
      }

      if (this.functionsWatcher) {
        closePromises.push(this.functionsWatcher.close());
      }

      if (this.frontComponentsWatcher) {
        closePromises.push(this.frontComponentsWatcher.close());
      }

      await Promise.all(closePromises);

      process.exit(0);
    });
  }
}
