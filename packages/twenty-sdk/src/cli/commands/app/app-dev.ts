import {
  createFrontComponentsWatcher,
  createLogicFunctionsWatcher,
  type EsbuildWatcher,
} from '@/cli/utilities/build/common/esbuild-watcher';
import { type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { DevModeOrchestrator } from '@/cli/utilities/dev/dev-mode-orchestrator';
import path from 'path';
import * as fs from 'fs-extra';
import { DevUiStateManager } from '@/cli/utilities/dev/dev-ui-state-manager';
import { renderDevUI } from '@/cli/utilities/dev/dev-ui';
import { ASSETS_DIR, OUTPUT_DIR } from 'twenty-shared/application';
import { FileUploadWatcher } from '@/cli/utilities/build/common/file-upload-watcher';
import { FileFolder } from 'twenty-shared/types';

export type AppDevOptions = {
  appPath?: string;
};

export class AppDevCommand {
  private appPath = '';
  private orchestrator: DevModeOrchestrator | null = null;
  private manifestWatcher: ManifestWatcher | null = null;
  private logicFunctionsWatcher: EsbuildWatcher | null = null;
  private frontComponentsWatcher: EsbuildWatcher | null = null;
  private assetWatcher: FileUploadWatcher | null = null;
  private dependencyWatcher: FileUploadWatcher | null = null;
  private watchersStarted = false;
  private uiStateManager: DevUiStateManager | null = null;
  private unmountUI: (() => void) | null = null;

  async close(): Promise<void> {
    this.unmountUI?.();

    await Promise.all([
      this.manifestWatcher?.close(),
      this.logicFunctionsWatcher?.close(),
      this.frontComponentsWatcher?.close(),
      this.assetWatcher?.close(),
      this.dependencyWatcher?.close(),
    ]);
  }

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
    const { logicFunctions, frontComponents } = result.filePaths;

    if (!this.watchersStarted) {
      this.watchersStarted = true;
      await this.startFileWatchers(logicFunctions, frontComponents);
      return;
    }

    if (this.logicFunctionsWatcher?.shouldRestart(logicFunctions)) {
      await this.logicFunctionsWatcher.restart(logicFunctions);
    }

    if (this.frontComponentsWatcher?.shouldRestart(frontComponents)) {
      await this.frontComponentsWatcher.restart(frontComponents);
    }
  }

  private async startFileWatchers(
    logicFunctions: string[],
    frontComponents: string[],
  ): Promise<void> {
    await Promise.all([
      this.startLogicFunctionsWatcher(logicFunctions),
      this.startFrontComponentsWatcher(frontComponents),
      this.startAssetWatcher(),
      this.startDependencyWatcher(),
    ]);
  }

  private async startLogicFunctionsWatcher(
    sourcePaths: string[],
  ): Promise<void> {
    this.logicFunctionsWatcher = createLogicFunctionsWatcher({
      appPath: this.appPath,
      sourcePaths,
      handleBuildError: this.orchestrator!.handleFileBuildError.bind(
        this.orchestrator,
      ),
      handleFileBuilt: this.orchestrator!.handleFileBuilt.bind(
        this.orchestrator,
      ),
    });

    await this.logicFunctionsWatcher.start();
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

  private async startAssetWatcher(): Promise<void> {
    this.assetWatcher = new FileUploadWatcher({
      appPath: this.appPath,
      fileFolder: FileFolder.PublicAsset,
      watchPaths: [ASSETS_DIR],
      handleFileBuilt: this.orchestrator!.handleFileBuilt.bind(
        this.orchestrator,
      ),
    });

    await this.assetWatcher.start();
  }

  private async startDependencyWatcher(): Promise<void> {
    this.dependencyWatcher = new FileUploadWatcher({
      appPath: this.appPath,
      fileFolder: FileFolder.Dependencies,
      watchPaths: ['package.json', 'yarn.lock'],
      handleFileBuilt: this.orchestrator!.handleFileBuilt.bind(
        this.orchestrator,
      ),
    });

    this.dependencyWatcher.start();
  }

  private setupGracefulShutdown(): void {
    const shutdown = () => void this.close().then(() => process.exit(0));

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
