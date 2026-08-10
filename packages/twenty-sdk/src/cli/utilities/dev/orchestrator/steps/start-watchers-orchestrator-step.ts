import {
  createFrontComponentsWatcher,
  createLogicFunctionsWatcher,
  type EsbuildWatcher,
} from '@/cli/utilities/build/common/esbuild-watcher';
import { FileUploadWatcher } from '@/cli/utilities/build/common/file-upload-watcher';
import { TscWatcher } from '@/cli/utilities/build/common/tsc-watcher';
import { type TypecheckError } from '@/cli/utilities/build/common/typecheck-plugin';
import { type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { VendorBundleWatcher } from '@/cli/utilities/build/common/vendor-build/vendor-bundle-watcher';
import { ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import type { Location } from 'esbuild';
import { type ChokidarFsEvent } from '@/cli/types';
import { ASSETS_DIR, type VendorManifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type FileBuiltEvent = {
  fileFolder: FileFolder;
  builtPath: string;
  sourcePath: string;
  checksum: string;
  usesSdkClient?: boolean;
};

export type StartWatchersOrchestratorStepOutput = {
  watchersStarted: boolean;
};

export class StartWatchersOrchestratorStep {
  private state: OrchestratorState;
  private scheduleSync: () => void;
  private notify: () => void;
  private onFileBuilt: (event: FileBuiltEvent) => void;
  private shouldSkipTypecheck: () => boolean;
  private verbose: boolean;

  private manifestWatcher: ManifestWatcher | null = null;
  private logicFunctionsWatcher: EsbuildWatcher | null = null;
  private frontComponentsWatcher: EsbuildWatcher | null = null;
  private vendorBundleWatcher: VendorBundleWatcher | null = null;
  private frontComponentSourcePaths: string[] = [];
  private assetWatcher: FileUploadWatcher | null = null;
  private dependencyWatcher: FileUploadWatcher | null = null;
  private tscWatcher: TscWatcher | null = null;

  constructor(options: {
    state: OrchestratorState;
    scheduleSync: () => void;
    notify: () => void;
    onFileBuilt: (event: FileBuiltEvent) => void;
    shouldSkipTypecheck: () => boolean;
    verbose?: boolean;
  }) {
    this.state = options.state;
    this.scheduleSync = options.scheduleSync;
    this.notify = options.notify;
    this.onFileBuilt = options.onFileBuilt;
    this.shouldSkipTypecheck = options.shouldSkipTypecheck;
    this.verbose = options.verbose ?? false;
  }

  async start(): Promise<void> {
    this.state.steps.startWatchers.status = 'in_progress';
    this.notify();

    this.manifestWatcher = new ManifestWatcher({
      appPath: this.state.appPath,
      handleChangeDetected: this.handleChangeDetected.bind(this),
      verbose: this.verbose,
    });

    await this.manifestWatcher.start();
  }

  async handleWatcherRestarts(result: ManifestBuildResult): Promise<void> {
    const { logicFunctions, frontComponents } = result.filePaths;
    const vendor = result.manifest?.application.vendor;

    if (!this.state.steps.startWatchers.output.watchersStarted) {
      this.state.steps.startWatchers.output.watchersStarted = true;
      this.state.steps.startWatchers.status = 'done';
      await this.startVendorBundleWatcher(vendor);
      await this.startFileWatchers(logicFunctions, frontComponents);

      return;
    }

    await this.handleVendorBundleWatcherRestart(vendor);

    if (this.logicFunctionsWatcher?.shouldRestart(logicFunctions)) {
      await this.logicFunctionsWatcher.restart(logicFunctions);
    }

    if (this.frontComponentsWatcher?.shouldRestart(frontComponents)) {
      this.frontComponentSourcePaths = frontComponents;
      await this.frontComponentsWatcher.restart(frontComponents);
    }
  }

  async close(): Promise<void> {
    this.tscWatcher?.close();

    await Promise.all([
      this.manifestWatcher?.close(),
      this.vendorBundleWatcher?.close(),
      this.logicFunctionsWatcher?.close(),
      this.frontComponentsWatcher?.close(),
      this.assetWatcher?.close(),
      this.dependencyWatcher?.close(),
    ]);
  }

  private handleChangeDetected(
    sourcePath: string,
    event: ChokidarFsEvent,
  ): void {
    this.state.addEvent({
      message: `Change detected: ${sourcePath}`,
      status: 'info',
      spacingBefore: true,
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

  private handleFileBuilt(event: FileBuiltEvent): void {
    if (this.verbose) {
      this.state.addEvent({
        message: `Successfully built ${event.builtPath}`,
        status: 'success',
      });
    }

    this.state.steps.uploadFiles.output.builtFileInfos.set(event.builtPath, {
      checksum: event.checksum,
      builtPath: event.builtPath,
      sourcePath: event.sourcePath,
      fileFolder: event.fileFolder,
      usesSdkClient: event.usesSdkClient,
    });

    this.onFileBuilt(event);

    this.notify();
    this.scheduleSync();
  }

  private async startFileWatchers(
    logicFunctions: string[],
    frontComponents: string[],
  ): Promise<void> {
    await Promise.all([
      this.startTscWatcher(),
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
      shouldSkipTypecheck: this.shouldSkipTypecheck,
      handleBuildError: this.handleFileBuildError.bind(this),
      handleFileBuilt: this.handleFileBuilt.bind(this),
    });

    await this.logicFunctionsWatcher.start();
  }

  private async startFrontComponentsWatcher(
    sourcePaths: string[],
  ): Promise<void> {
    this.frontComponentSourcePaths = sourcePaths;

    this.frontComponentsWatcher = createFrontComponentsWatcher({
      appPath: this.state.appPath,
      sourcePaths,
      shouldSkipTypecheck: this.shouldSkipTypecheck,
      handleBuildError: this.handleFileBuildError.bind(this),
      handleFileBuilt: this.handleFileBuilt.bind(this),
      getVendorBuildContext: () =>
        this.vendorBundleWatcher?.getContext() ?? null,
    });

    await this.frontComponentsWatcher.start();
  }

  private async rebuildFrontComponentsAgainstCurrentVendor(): Promise<void> {
    await this.frontComponentsWatcher?.restart(this.frontComponentSourcePaths);
  }

  private async startVendorBundleWatcher(
    vendor: VendorManifest | undefined,
  ): Promise<void> {
    if (!isDefined(vendor)) {
      return;
    }

    this.vendorBundleWatcher = new VendorBundleWatcher({
      appPath: this.state.appPath,
      vendor,
      handleBuildError: this.handleFileBuildError.bind(this),
      handleFileBuilt: this.handleFileBuilt.bind(this),
      handleVendorRebuilt: () =>
        this.rebuildFrontComponentsAgainstCurrentVendor(),
    });

    await this.vendorBundleWatcher.start();
  }

  private async handleVendorBundleWatcherRestart(
    vendor: VendorManifest | undefined,
  ): Promise<void> {
    const hasVendorWatcher = isDefined(this.vendorBundleWatcher);
    const isVendorAdded = isDefined(vendor) && !hasVendorWatcher;
    const isVendorRemoved = !isDefined(vendor) && hasVendorWatcher;
    const isVendorDependenciesChanged =
      isDefined(vendor) && this.vendorBundleWatcher?.shouldRestart(vendor);

    if (!isVendorAdded && !isVendorRemoved && !isVendorDependenciesChanged) {
      return;
    }

    await this.vendorBundleWatcher?.close();
    this.vendorBundleWatcher = null;

    if (isDefined(vendor)) {
      await this.startVendorBundleWatcher(vendor);

      return;
    }

    await this.rebuildFrontComponentsAgainstCurrentVendor();
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

  private async startTscWatcher(): Promise<void> {
    this.tscWatcher = new TscWatcher({
      appPath: this.state.appPath,
      onErrors: this.handleTypecheckErrors.bind(this),
    });

    await this.tscWatcher.start();
  }

  private handleTypecheckErrors(errors: TypecheckError[]): void {
    if (errors.length === 0) {
      this.state.addEvent({
        message: 'Typecheck passed',
        status: 'success',
      });
    } else {
      this.state.applyStepEvents(
        errors.map((error) => ({
          message: `Type error in ${error.file}(${error.line},${error.column}): ${error.text}`,
          status: 'error' as const,
        })),
      );
    }

    this.notify();
  }
}
