import {
  extractFrontComponentEntryPoints,
  extractFunctionEntryPoints,
} from '@/cli/utilities/build/common/entry-points';
import { createFrontComponentsWatcher, type FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { createFunctionsWatcher, type FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import {
  createManifestWatcher,
  runManifestBuild,
  type ManifestWatcher,
} from '@/cli/utilities/build/manifest/manifest-watcher';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import chalk from 'chalk';
import { type ApplicationManifest } from 'twenty-shared/application';

export type AppDevOptions = {
  appPath?: string;
};

type AppDevState = {
  manifest: ApplicationManifest | null;
  builtFunctionEntryPoints: string[];
  builtFrontComponentEntryPoints: string[];
};

export class AppDevCommand {
  private manifestWatcher: ManifestWatcher | null = null;
  private functionsWatcher: FunctionsWatcher | null = null;
  private frontComponentsWatcher: FrontComponentsWatcher | null = null;

  private appPath: string = '';
  private state: AppDevState = {
    manifest: null,
    builtFunctionEntryPoints: [],
    builtFrontComponentEntryPoints: [],
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
    const { manifest } = await runManifestBuild(this.appPath, null);

    if (manifest) {
      this.state.manifest = manifest;
    }

    await Promise.all([
      this.startManifestWatcher(manifest),
      this.startFunctionsWatcher(manifest),
      this.startFrontComponentsWatcher(manifest),
    ]);
  }

  private async startManifestWatcher(initialManifest: ApplicationManifest): Promise<void> {
    this.manifestWatcher = createManifestWatcher({
      appPath: this.appPath,
      initialManifest,
      callbacks: {
        onBuildSuccess: ({ manifest }) => {
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

    console.log(chalk.gray('  📂 Manifest watcher started'));
  }

  private async startFunctionsWatcher(manifest: ApplicationManifest): Promise<void> {
    this.functionsWatcher = await createFunctionsWatcher({
      appPath: this.appPath,
      manifest,
      callbacks: {
        onBuildSuccess: () => {
          this.state.builtFunctionEntryPoints = extractFunctionEntryPoints(
            this.state.manifest?.serverlessFunctions ?? [],
          );
        },
      },
    });
  }

  private async startFrontComponentsWatcher(manifest: ApplicationManifest): Promise<void> {
    this.frontComponentsWatcher = await createFrontComponentsWatcher({
      appPath: this.appPath,
      manifest,
      callbacks: {
        onBuildSuccess: () => {
          this.state.builtFrontComponentEntryPoints = extractFrontComponentEntryPoints(
            this.state.manifest?.frontComponents ?? [],
          );
        },
      },
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
