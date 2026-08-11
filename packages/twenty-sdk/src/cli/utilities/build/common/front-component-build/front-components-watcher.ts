import { EsbuildWatcher } from '@/cli/utilities/build/common/esbuild-watcher';
import { FRONT_COMPONENT_EXTERNAL_MODULES } from '@/cli/utilities/build/common/front-component-build/constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';
import { createStubTwentySdkDefinePlugin } from '@/cli/utilities/build/common/plugins/stub-twenty-sdk-define.plugin';
import {
  type OnBuildErrorCallback,
  type OnFileBuiltCallback,
} from '@/cli/utilities/build/common/restartable-watcher-interface';
import { createTypecheckPlugin } from '@/cli/utilities/build/common/typecheck-plugin';
import { buildVendorBundle } from '@/cli/utilities/build/common/vendor-build/build-vendor-bundle';
import { type VendorBuildContext } from '@/cli/utilities/build/common/vendor-build/types/vendor-build-context.type';
import { pathExists } from '@/cli/utilities/file/fs-utils';
import { isNonEmptyArray } from '@sniptt/guards';
import chokidar, { type FSWatcher } from 'chokidar';
import { join } from 'path';
import { FileFolder } from 'twenty-shared/types';
import { type VendorManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const INSTALLED_DEPENDENCY_VERSION_PATHS = ['package.json', 'yarn.lock'];

export type FrontComponentsWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  vendor?: VendorManifest;
  watch?: boolean;
  shouldSkipTypecheck: () => boolean;
  handleFileBuilt: OnFileBuiltCallback;
  handleBuildError: OnBuildErrorCallback;
};

export class FrontComponentsWatcher {
  private appPath: string;
  private sourcePaths: string[];
  private vendor: VendorManifest | undefined;
  private watchMode: boolean;
  private shouldSkipTypecheck: () => boolean;
  private handleFileBuilt: OnFileBuiltCallback;
  private handleBuildError: OnBuildErrorCallback;
  private componentsWatcher: EsbuildWatcher | null = null;
  private vendorBuildContext: VendorBuildContext | null = null;
  private lastVendorChecksum: string | null = null;
  private vendorDependencyWatcher: FSWatcher | null = null;
  private isClosed = false;
  private isApplyingRestart = false;
  private vendorBuildGeneration = 0;
  private inFlightVendorBuildPromise: Promise<void> | null = null;
  private hasVendorBuildRequestedDuringInFlightBuild = false;

  constructor(options: FrontComponentsWatcherOptions) {
    this.appPath = options.appPath;
    this.sourcePaths = options.sourcePaths;
    this.vendor = options.vendor;
    this.watchMode = options.watch ?? true;
    this.shouldSkipTypecheck = options.shouldSkipTypecheck;
    this.handleFileBuilt = options.handleFileBuilt;
    this.handleBuildError = options.handleBuildError;
  }

  getVendorBuildContext(): VendorBuildContext | null {
    return this.vendorBuildContext;
  }

  shouldRestart(
    sourcePaths: string[],
    vendor: VendorManifest | undefined,
  ): boolean {
    return (
      (this.componentsWatcher?.shouldRestart(sourcePaths) ?? true) ||
      this.hasVendorManifestChanged(vendor)
    );
  }

  async start(): Promise<void> {
    if (isDefined(this.vendor)) {
      await this.requestVendorBuild();
      await this.startVendorDependencyWatcher();
    }

    this.componentsWatcher = new EsbuildWatcher({
      appPath: this.appPath,
      sourcePaths: this.sourcePaths,
      watch: this.watchMode,
      handleFileBuilt: this.handleFileBuilt,
      handleBuildError: this.handleBuildError,
      config: {
        externalModules: FRONT_COMPONENT_EXTERNAL_MODULES,
        fileFolder: FileFolder.BuiltFrontComponent,
        jsx: 'automatic',
        extraPlugins: [
          createTypecheckPlugin(this.appPath, this.shouldSkipTypecheck),
          ...getFrontComponentBuildPlugins({
            getVendorBuildContext: () => this.vendorBuildContext,
          }),
          createStubTwentySdkDefinePlugin(),
        ],
      },
    });

    await this.componentsWatcher.start();
  }

  async restart(
    sourcePaths: string[],
    vendor: VendorManifest | undefined,
  ): Promise<void> {
    this.isApplyingRestart = true;

    try {
      const hasVendorManifestChanged = this.hasVendorManifestChanged(vendor);

      this.sourcePaths = sourcePaths;

      if (hasVendorManifestChanged) {
        this.vendorBuildGeneration += 1;
        this.hasVendorBuildRequestedDuringInFlightBuild = false;
        await this.inFlightVendorBuildPromise;
        await this.vendorDependencyWatcher?.close();
        this.vendorDependencyWatcher = null;
        this.vendor = vendor;
        this.vendorBuildContext = null;
        this.lastVendorChecksum = null;

        if (isDefined(vendor)) {
          await this.requestVendorBuild();
          await this.startVendorDependencyWatcher();
        }
      }

      await this.componentsWatcher?.restart(sourcePaths);
    } finally {
      this.isApplyingRestart = false;
    }
  }

  async close(): Promise<void> {
    this.isClosed = true;
    await this.vendorDependencyWatcher?.close();
    this.vendorDependencyWatcher = null;
    await this.componentsWatcher?.close();
    this.componentsWatcher = null;
  }

  private hasVendorManifestChanged(
    vendor: VendorManifest | undefined,
  ): boolean {
    if (!isDefined(vendor) || !isDefined(this.vendor)) {
      return isDefined(vendor) !== isDefined(this.vendor);
    }

    return (
      vendor.sourceVendorPath !== this.vendor.sourceVendorPath ||
      vendor.dependencies.join(',') !== this.vendor.dependencies.join(',')
    );
  }

  private async requestVendorBuild(): Promise<void> {
    if (isDefined(this.inFlightVendorBuildPromise)) {
      this.hasVendorBuildRequestedDuringInFlightBuild = true;

      return;
    }

    this.inFlightVendorBuildPromise = this.runVendorBuild();

    try {
      await this.inFlightVendorBuildPromise;
    } finally {
      this.inFlightVendorBuildPromise = null;

      if (this.hasVendorBuildRequestedDuringInFlightBuild) {
        this.hasVendorBuildRequestedDuringInFlightBuild = false;

        await this.requestVendorBuild();
      }
    }
  }

  private async runVendorBuild(): Promise<void> {
    const vendor = this.vendor;
    const generation = this.vendorBuildGeneration;

    if (!isDefined(vendor)) {
      return;
    }

    const isObsolete = () =>
      this.isClosed || generation !== this.vendorBuildGeneration;

    try {
      let builtChecksum: string | null = null;

      const vendorBuildContext = await buildVendorBundle({
        appPath: this.appPath,
        vendor,
        onFileBuilt: async (event) => {
          builtChecksum = event.checksum;

          if (isObsolete() || event.checksum === this.lastVendorChecksum) {
            return;
          }

          await this.handleFileBuilt(event);
        },
      });

      if (isObsolete()) {
        return;
      }

      this.vendorBuildContext = vendorBuildContext;

      if (builtChecksum !== this.lastVendorChecksum) {
        this.lastVendorChecksum = builtChecksum;

        if (!this.isApplyingRestart) {
          await this.componentsWatcher?.restart(this.sourcePaths);
        }
      }
    } catch (error) {
      if (isObsolete()) {
        return;
      }

      await this.handleBuildError([
        {
          error: error instanceof Error ? error.message : String(error),
          location: null,
        },
      ]);
    }
  }

  private async startVendorDependencyWatcher(): Promise<void> {
    const watchedPaths = (
      await Promise.all(
        INSTALLED_DEPENDENCY_VERSION_PATHS.map(async (watchPath) => {
          const absolutePath = join(this.appPath, watchPath);

          return (await pathExists(absolutePath)) ? absolutePath : null;
        }),
      )
    ).filter(isDefined);

    if (!isNonEmptyArray(watchedPaths)) {
      return;
    }

    this.vendorDependencyWatcher = chokidar.watch(watchedPaths, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.vendorDependencyWatcher.on('all', (event) => {
      if (event === 'add' || event === 'change') {
        void this.requestVendorBuild();
      }
    });
  }
}
