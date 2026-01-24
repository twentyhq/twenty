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

/**
 * Runs the development mode for Twenty applications.
 *
 * Flow:
 * 1. ManifestWatcher detects file changes and rebuilds the manifest
 * 2. FunctionsWatcher/FrontComponentsWatcher rebuild and upload affected files
 * 3. After changes settle (debounce), sync with the API
 */
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

    this.orchestrator = new DevModeOrchestrator({ appPath: this.appPath });

    await this.startManifestWatcher();
    this.setupGracefulShutdown();
  }

  private async startManifestWatcher(): Promise<void> {
    this.manifestWatcher = new ManifestWatcher({
      appPath: this.appPath,
      callbacks: {
        onChangeDetected: () => {
          this.orchestrator!.onChangeDetected();
        },
        onBuildComplete: (result: ManifestBuildResult) => {
          this.orchestrator!.onManifestBuilt(result);

          if (result.manifest) {
            this.handleWatcherRestarts(result);
          }
        },
      },
    });

    await this.manifestWatcher.start();
  }

  /**
   * Starts or restarts file watchers when the file list changes.
   */
  private handleWatcherRestarts(result: ManifestBuildResult): void {
    const { functions, frontComponents } = result.filePaths;

    // Start watchers on first successful manifest build
    if (!this.watchersStarted) {
      this.watchersStarted = true;
      void this.startFileWatchers(functions, frontComponents);
      return;
    }

    // Restart watchers if file lists changed
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
      onFileBuilt: (builtPath, checksum) => {
        this.orchestrator!.onFileBuilt('function', builtPath, checksum);
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
      onFileBuilt: (builtPath, checksum) => {
        this.orchestrator!.onFileBuilt('frontComponent', builtPath, checksum);
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
