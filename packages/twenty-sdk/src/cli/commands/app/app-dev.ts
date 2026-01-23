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
 * AppDevCommand orchestrates the development mode for Twenty applications.
 *
 * It uses a generation-based event queue (DevModeOrchestrator) to handle
 * race conditions when multiple files change simultaneously:
 *
 * 1. ManifestWatcher detects changes and calls onChangeDetected() to start a new generation
 * 2. The manifest is rebuilt and passed to onManifestBuilt()
 * 3. FunctionsWatcher and FrontComponentsWatcher rebuild affected files
 * 4. Each built file calls onFileBuilt() with its generation number
 * 5. Only when ALL operations for the current generation complete does sync happen
 * 6. Stale callbacks from previous generations are ignored
 */
export class AppDevCommand {
  private orchestrator: DevModeOrchestrator | null = null;
  private manifestWatcher: ManifestWatcher | null = null;
  private functionsWatcher: FunctionsWatcher | null = null;
  private frontComponentsWatcher: FrontComponentsWatcher | null = null;

  private appPath: string = '';
  private watchersStarted = false;

  async execute(options: AppDevOptions): Promise<void> {
    this.appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    initLogger.log('🚀 Starting Twenty Application Development Mode');
    initLogger.log(`📁 App Path: ${this.appPath}`);
    console.log('');

    // Initialize the orchestrator
    this.orchestrator = new DevModeOrchestrator({ appPath: this.appPath });

    await this.startWatchers();

    this.setupGracefulShutdown();
  }

  private async startWatchers(): Promise<void> {
    await this.startManifestWatcher();
  }

  private async startManifestWatcher(): Promise<void> {
    this.manifestWatcher = new ManifestWatcher({
      appPath: this.appPath,
      callbacks: {
        onChangeDetected: (filePath?: string) => {
          return this.orchestrator!.onChangeDetected(filePath);
        },
        onBuildComplete: (generation: number, result: ManifestBuildResult) => {
          // Notify orchestrator of manifest build completion
          this.orchestrator!.onManifestBuilt(generation, result);

          // Handle watcher restarts separately (per plan requirement)
          if (result.manifest) {
            this.handleWatcherRestarts(result);
          }
        },
      },
    });

    await this.manifestWatcher.start();
  }

  /**
   * Handles restarting function/component watchers when file lists change.
   * This is separate from the orchestrator's event queue.
   */
  private handleWatcherRestarts(result: ManifestBuildResult): void {
    const functionSourcePaths = result.filePaths.functions;
    const componentSourcePaths = result.filePaths.frontComponents;

    // Start watchers on first successful manifest build
    if (!this.watchersStarted) {
      this.watchersStarted = true;
      void this.startFileWatchers(functionSourcePaths, componentSourcePaths);

      return;
    }

    // Check if functions watcher needs restart
    const shouldRestartFunctions =
      this.functionsWatcher?.shouldRestart(functionSourcePaths);
    if (shouldRestartFunctions) {
      this.functionsWatcher?.restart(functionSourcePaths);
    }

    // Check if components watcher needs restart
    const shouldRestartFrontComponents =
      this.frontComponentsWatcher?.shouldRestart(componentSourcePaths);
    if (shouldRestartFrontComponents) {
      this.frontComponentsWatcher?.restart(componentSourcePaths);
    }
  }

  /**
   * Starts the function and component watchers.
   */
  private async startFileWatchers(
    functionSourcePaths: string[],
    componentSourcePaths: string[],
  ): Promise<void> {
    await Promise.all([
      this.startFunctionsWatcher(functionSourcePaths),
      this.startFrontComponentsWatcher(componentSourcePaths),
    ]);
  }

  private async startFunctionsWatcher(sourcePaths: string[]): Promise<void> {
    this.functionsWatcher = new FunctionsWatcher({
      appPath: this.appPath,
      sourcePaths,
      getCurrentGeneration: () => this.orchestrator!.getCurrentGeneration(),
      onFileBuilt: (generation, builtPath, checksum) => {
        this.orchestrator!.onFileBuilt(
          generation,
          'function',
          builtPath,
          checksum,
        );
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
      getCurrentGeneration: () => this.orchestrator!.getCurrentGeneration(),
      onFileBuilt: (generation, builtPath, checksum) => {
        this.orchestrator!.onFileBuilt(
          generation,
          'frontComponent',
          builtPath,
          checksum,
        );
      },
    });

    await this.frontComponentsWatcher.start();
  }

  private setupGracefulShutdown(): void {
    const shutdown = async () => {
      console.log('');
      initLogger.warn('🛑 Stopping...');

      // Close all watchers
      await this.manifestWatcher?.close();
      await this.functionsWatcher?.close();
      await this.frontComponentsWatcher?.close();
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown());
    process.on('SIGTERM', () => void shutdown());
  }
}
