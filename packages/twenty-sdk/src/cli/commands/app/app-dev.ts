import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import { type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-build';
import { ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { DevModeOrchestrator } from '@/cli/utilities/dev/dev-mode-orchestrator';
import { devUIState } from '@/cli/utilities/dev/dev-ui-state';
import { renderDevUI } from '@/cli/utilities/dev/dev-ui';

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
  private unmountUI: (() => void) | null = null;

  async execute(options: AppDevOptions): Promise<void> {
    this.appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    // Get frontend URL from config
    const configService = new ConfigService();
    const config = await configService.getConfig();
    const frontendUrl = config.apiUrl.replace('3000', '3001'); // Frontend is at the same base URL, except for localhost

    // Initialize UI state and render Ink UI
    devUIState.init(this.appPath, frontendUrl);
    const { unmount } = await renderDevUI();
    this.unmountUI = unmount;

    this.orchestrator = new DevModeOrchestrator({ appPath: this.appPath });

    await this.startManifestWatcher();
    this.setupGracefulShutdown();
  }

  private async startManifestWatcher(): Promise<void> {
    this.manifestWatcher = new ManifestWatcher({
      appPath: this.appPath,
      callbacks: {
        onChangeDetected: (filePath?: string) => {
          this.orchestrator!.onChangeDetected(filePath);
        },
        onBuildComplete: (result: ManifestBuildResult, filePath?: string) => {
          this.orchestrator!.onManifestBuilt(result, filePath);

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
    // Extract source paths from entities
    const functionPaths = result.entities.functions.map((fn) => fn.sourcePath);
    const frontComponentPaths = result.entities.frontComponents.map(
      (fc) => fc.sourcePath,
    );

    // Start watchers on first successful manifest build
    if (!this.watchersStarted) {
      this.watchersStarted = true;
      void this.startFileWatchers(functionPaths, frontComponentPaths);
      return;
    }

    // Restart watchers if file lists changed
    if (this.functionsWatcher?.shouldRestart(functionPaths)) {
      this.functionsWatcher.restart(functionPaths);
    }

    if (this.frontComponentsWatcher?.shouldRestart(frontComponentPaths)) {
      this.frontComponentsWatcher.restart(frontComponentPaths);
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
      onFileBuilt: async (builtPath, checksum, sourcePath) => {
        await this.orchestrator!.onFileBuilt(
          'function',
          builtPath,
          sourcePath,
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
      onFileBuilt: async (builtPath, checksum, sourcePath) => {
        await this.orchestrator!.onFileBuilt(
          'frontComponent',
          builtPath,
          sourcePath,
          checksum,
        );
      },
    });

    await this.frontComponentsWatcher.start();
  }

  private setupGracefulShutdown(): void {
    const shutdown = async () => {
      // Unmount Ink UI before exiting
      this.unmountUI?.();

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
