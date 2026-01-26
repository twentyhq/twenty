import { createLogger } from '@/cli/utilities/build/common/logger';
import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import { type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-build';
import { ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { DevModeOrchestrator } from '@/cli/utilities/dev/dev-mode-orchestrator';

const initLogger = createLogger('init');

export type AppDevOptions = {
  appPath?: string;
};

export class AppDevCommand {
  private appPath = '';
  private orchestrator: DevModeOrchestrator | null = null;
  private manifestWatcher: ManifestWatcher | null = null;
  private functionsWatcher: FunctionsWatcher | null = null;
  private frontComponentsWatcher: FrontComponentsWatcher | null = null;
  private watchersStarted = false;

  async execute(options: AppDevOptions): Promise<void> {
    this.appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    initLogger.log('🚀 Starting Twenty Application Development Mode');
    initLogger.log(`📁 App Path: ${this.appPath}`);
    console.log('');

    this.orchestrator = new DevModeOrchestrator({
      appPath: this.appPath,
      onManifestBuilt: this.handleWatcherRestarts.bind(this),
    });

    await this.startManifestWatcher();
    this.setupGracefulShutdown();
  }

  private async startManifestWatcher(): Promise<void> {
    this.manifestWatcher = new ManifestWatcher({
      appPath: this.appPath,
      onChangeDetected: this.orchestrator!.onChangeDetected.bind(
        this.orchestrator,
      ),
    });

    await this.manifestWatcher.start();
  }

  private handleWatcherRestarts(result: ManifestBuildResult): void {
    const { functions, frontComponents } = result.filePaths;

    if (!this.watchersStarted) {
      this.watchersStarted = true;
      void this.startFileWatchers(functions, frontComponents);
      return;
    }

    if (this.functionsWatcher?.shouldRestart(functions)) {
      this.functionsWatcher.restart(functions);
    }

    if (this.frontComponentsWatcher?.shouldRestart(frontComponents)) {
      this.frontComponentsWatcher.restart(frontComponents);
    }
  }

  private async startFileWatchers(
    functions: string[],
    frontComponents: string[],
  ): Promise<void> {
    await Promise.all([
      this.startFunctionsWatcher(functions),
      this.startFrontComponentsWatcher(frontComponents),
    ]);
  }

  private async startFunctionsWatcher(sourcePaths: string[]): Promise<void> {
    this.functionsWatcher = new FunctionsWatcher({
      appPath: this.appPath,
      sourcePaths,
      onBuildError: this.orchestrator!.onFileBuildError.bind(this.orchestrator),
      onFileBuilt: ({ fileFolder, builtPath, filePath, checksum }) => {
        this.orchestrator!.onFileBuilt({
          fileFolder,
          builtPath,
          filePath,
          checksum,
        });
      },
    });

    await this.functionsWatcher.start();
  }

  private async startFrontComponentsWatcher(
    sourcePaths: string[],
  ): Promise<void> {
    this.frontComponentsWatcher = new FrontComponentsWatcher({
      appPath: this.appPath,
      sourcePaths,
      onBuildError: this.orchestrator!.onFileBuildError.bind(this.orchestrator),
      onFileBuilt: ({ fileFolder, builtPath, filePath, checksum }) => {
        this.orchestrator!.onFileBuilt({
          fileFolder,
          builtPath,
          filePath,
          checksum,
        });
      },
    });

    await this.frontComponentsWatcher.start();
  }

  private setupGracefulShutdown(): void {
    const shutdown = async () => {
      console.log('');
      initLogger.warn('🛑 Stopping...');

      await Promise.all([
        this.manifestWatcher?.close(),
        this.functionsWatcher?.close(),
        this.frontComponentsWatcher?.close(),
      ]);

      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown());
    process.on('SIGTERM', () => void shutdown());
  }
}
