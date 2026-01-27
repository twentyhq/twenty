import {
  createFrontComponentsWatcher,
  createFunctionsWatcher,
  type EsbuildWatcher,
} from '@/cli/utilities/build/common/esbuild-watcher';
import { type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-build';
import { ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { DevModeOrchestrator } from '@/cli/utilities/dev/dev-mode-orchestrator';
import path from 'path';
import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';
import * as fs from 'fs-extra';
import { DevUiStateManager } from '@/cli/utilities/dev/dev-ui-state-manager';
import { renderDevUI } from '@/cli/utilities/dev/dev-ui';

export type AppDevOptions = {
  appPath?: string;
};

export class AppDevCommand {
  private appPath = '';
  private orchestrator: DevModeOrchestrator | null = null;
  private manifestWatcher: ManifestWatcher | null = null;
  private functionsWatcher: EsbuildWatcher | null = null;
  private frontComponentsWatcher: EsbuildWatcher | null = null;
  private watchersStarted = false;
  private uiStateManager: DevUiStateManager | null = null;
  private unmountUI: (() => void) | null = null;

  async execute(options: AppDevOptions): Promise<void> {
    this.appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await this.cleanOutputDir();

    this.uiStateManager = new DevUiStateManager({
      appPath: this.appPath,
      frontendUrl: process.env.FRONTEND_URL,
    });

    const { unmount } = await renderDevUI(this.uiStateManager);

    this.unmountUI = unmount;

    this.orchestrator = new DevModeOrchestrator({
      appPath: this.appPath,
      handleManifestBuilt: this.handleWatcherRestarts.bind(this),
      uiStateManager: this.uiStateManager,
    });

    await this.startManifestWatcher();
    this.setupGracefulShutdown();
  }

  private async cleanOutputDir() {
    const outputDir = path.join(this.appPath, OUTPUT_DIR);
    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);
  }

  private async startManifestWatcher(): Promise<void> {
    this.manifestWatcher = new ManifestWatcher({
      appPath: this.appPath,
      handleChangeDetected: this.orchestrator!.handleChangeDetected.bind(
        this.orchestrator,
      ),
    });

    await this.manifestWatcher.start();
  }

  private async handleWatcherRestarts(result: ManifestBuildResult) {
    const { functions, frontComponents } = result.filePaths;

    if (!this.watchersStarted) {
      this.watchersStarted = true;
      await this.startFileWatchers(functions, frontComponents);
      return;
    }

    if (this.functionsWatcher?.shouldRestart(functions)) {
      await this.functionsWatcher.restart(functions);
    }

    if (this.frontComponentsWatcher?.shouldRestart(frontComponents)) {
      await this.frontComponentsWatcher.restart(frontComponents);
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
    this.functionsWatcher = createFunctionsWatcher({
      appPath: this.appPath,
      sourcePaths,
      handleBuildError: this.orchestrator!.handleFileBuildError.bind(
        this.orchestrator,
      ),
      handleFileBuilt: this.orchestrator!.handleFileBuilt.bind(
        this.orchestrator,
      ),
    });

    await this.functionsWatcher.start();
  }

  private async startFrontComponentsWatcher(
    sourcePaths: string[],
  ): Promise<void> {
    this.frontComponentsWatcher = createFrontComponentsWatcher({
      appPath: this.appPath,
      sourcePaths,
      handleBuildError: this.orchestrator!.handleFileBuildError.bind(
        this.orchestrator,
      ),
      handleFileBuilt: this.orchestrator!.handleFileBuilt.bind(
        this.orchestrator,
      ),
    });

    await this.frontComponentsWatcher.start();
  }

  private setupGracefulShutdown(): void {
    const shutdown = async () => {
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
