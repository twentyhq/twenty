import {
  createFrontComponentsWatcher,
  createLogicFunctionsWatcher,
  type EsbuildWatcher,
} from '@/cli/utilities/build/common/esbuild-watcher';
import { FileUploadWatcher } from '@/cli/utilities/build/common/file-upload-watcher';
import { type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type UploadFilesOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/upload-files-orchestrator-step';
import type { Location } from 'esbuild';
import { type EventName } from 'chokidar/handler.js';
import { ASSETS_DIR } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export type StartWatchersOrchestratorStepOutput = {
  watchersStarted: boolean;
};

export class StartWatchersOrchestratorStep {
  private state: OrchestratorState;
  private scheduleSync: () => void;
  private notify: () => void;
  private uploadFilesStep: UploadFilesOrchestratorStep;

  private manifestWatcher: ManifestWatcher | null = null;
  private logicFunctionsWatcher: EsbuildWatcher | null = null;
  private frontComponentsWatcher: EsbuildWatcher | null = null;
  private assetWatcher: FileUploadWatcher | null = null;
  private dependencyWatcher: FileUploadWatcher | null = null;

  constructor(options: {
    state: OrchestratorState;
    scheduleSync: () => void;
    notify: () => void;
    uploadFilesStep: UploadFilesOrchestratorStep;
  }) {
    this.state = options.state;
    this.scheduleSync = options.scheduleSync;
    this.notify = options.notify;
    this.uploadFilesStep = options.uploadFilesStep;
  }

  async start(): Promise<void> {
    this.state.steps.startWatchers.status = 'in_progress';
    this.notify();

    this.manifestWatcher = new ManifestWatcher({
      appPath: this.state.appPath,
      handleChangeDetected: this.handleChangeDetected.bind(this),
    });

    await this.manifestWatcher.start();
  }

  async handleWatcherRestarts(result: ManifestBuildResult): Promise<void> {
    const { logicFunctions, frontComponents } = result.filePaths;

    if (!this.state.steps.startWatchers.output.watchersStarted) {
      this.state.steps.startWatchers.output.watchersStarted = true;
      this.state.steps.startWatchers.status = 'done';
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

  async close(): Promise<void> {
    await Promise.all([
      this.manifestWatcher?.close(),
      this.logicFunctionsWatcher?.close(),
      this.frontComponentsWatcher?.close(),
      this.assetWatcher?.close(),
      this.dependencyWatcher?.close(),
    ]);
  }

  private handleChangeDetected(sourcePath: string, event: EventName): void {
    this.state.addEvent({
      message: `Change detected: ${sourcePath}`,
      status: 'info',
    });

    if (event === 'unlink') {
      this.state.removeEntity(sourcePath);
    } else {
      this.state.updateEntityStatus(sourcePath, 'building');
    }

    this.notify();
    this.scheduleSync();
  }

  private handleFileBuildError(
    errors: { error: string; location: Location | null }[],
  ): void {
    this.state.addEvent({
      message: 'Build failed:',
      status: 'error',
    });

    for (const error of errors) {
      this.state.addEvent({
        message: error.error,
        status: 'error',
      });
    }

    this.notify();
  }

  private handleFileBuilt({
    fileFolder,
    builtPath,
    sourcePath,
    checksum,
  }: {
    fileFolder: FileFolder;
    builtPath: string;
    sourcePath: string;
    checksum: string;
  }): void {
    this.state.addEvent({
      message: `Successfully built ${builtPath}`,
      status: 'success',
    });

    this.state.steps.uploadFiles.output.builtFileInfos.set(builtPath, {
      checksum,
      builtPath,
      sourcePath,
      fileFolder,
    });

    if (this.state.steps.uploadFiles.output.fileUploader) {
      this.uploadFilesStep.uploadFile(builtPath, sourcePath, fileFolder);
    }

    this.notify();
    this.scheduleSync();
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
      appPath: this.state.appPath,
      sourcePaths,
      handleBuildError: this.handleFileBuildError.bind(this),
      handleFileBuilt: this.handleFileBuilt.bind(this),
    });

    await this.logicFunctionsWatcher.start();
  }

  private async startFrontComponentsWatcher(
    sourcePaths: string[],
  ): Promise<void> {
    this.frontComponentsWatcher = createFrontComponentsWatcher({
      appPath: this.state.appPath,
      sourcePaths,
      handleBuildError: this.handleFileBuildError.bind(this),
      handleFileBuilt: this.handleFileBuilt.bind(this),
    });

    await this.frontComponentsWatcher.start();
  }

  private async startAssetWatcher(): Promise<void> {
    this.assetWatcher = new FileUploadWatcher({
      appPath: this.state.appPath,
      fileFolder: FileFolder.PublicAsset,
      watchPaths: [ASSETS_DIR],
      handleFileBuilt: this.handleFileBuilt.bind(this),
    });

    await this.assetWatcher.start();
  }

  private async startDependencyWatcher(): Promise<void> {
    this.dependencyWatcher = new FileUploadWatcher({
      appPath: this.state.appPath,
      fileFolder: FileFolder.Dependencies,
      watchPaths: ['package.json', 'yarn.lock'],
      handleFileBuilt: this.handleFileBuilt.bind(this),
    });

    this.dependencyWatcher.start();
  }
}
