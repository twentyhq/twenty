import { EsbuildWatcher } from '@/cli/utilities/build/common/esbuild-watcher';
import { FRONT_COMPONENT_EXTERNAL_MODULES } from '@/cli/utilities/build/common/front-component-build/constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';
import { createStubTwentySdkDefinePlugin } from '@/cli/utilities/build/common/plugins/stub-twenty-sdk-define.plugin';
import {
  type OnBuildErrorCallback,
  type OnFileBuiltCallback,
} from '@/cli/utilities/build/common/restartable-watcher-interface';
import { createTypecheckPlugin } from '@/cli/utilities/build/common/typecheck-plugin';
import { buildSharedDependenciesBundle } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/build-shared-dependencies-bundle';
import { type SharedDependenciesBuildContext } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/types/shared-dependencies-build-context.type';
import { pathExists } from '@/cli/utilities/file/fs-utils';
import { isNonEmptyArray } from '@sniptt/guards';
import chokidar, { type FSWatcher } from 'chokidar';
import { join } from 'path';
import { FileFolder } from 'twenty-shared/types';
import { type FrontComponentSharedDependenciesManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const INSTALLED_DEPENDENCY_VERSION_PATHS = ['package.json', 'yarn.lock'];

export type FrontComponentsWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  sharedDependencies?: FrontComponentSharedDependenciesManifest;
  watch?: boolean;
  shouldSkipTypecheck: () => boolean;
  handleFileBuilt: OnFileBuiltCallback;
  handleBuildError: OnBuildErrorCallback;
};

export class FrontComponentsWatcher {
  private appPath: string;
  private sourcePaths: string[];
  private sharedDependencies:
    | FrontComponentSharedDependenciesManifest
    | undefined;
  private watchMode: boolean;
  private shouldSkipTypecheck: () => boolean;
  private handleFileBuilt: OnFileBuiltCallback;
  private handleBuildError: OnBuildErrorCallback;
  private componentsWatcher: EsbuildWatcher | null = null;
  private sharedDependenciesBuildContext: SharedDependenciesBuildContext | null =
    null;
  private lastSharedDependenciesChecksum: string | null = null;
  private installedDependenciesWatcher: FSWatcher | null = null;
  private isClosed = false;
  private isApplyingRestart = false;
  private sharedDependenciesBuildGeneration = 0;
  private inFlightSharedDependenciesBuildPromise: Promise<void> | null = null;
  private hasSharedDependenciesBuildRequestedDuringInFlightBuild = false;

  constructor(options: FrontComponentsWatcherOptions) {
    this.appPath = options.appPath;
    this.sourcePaths = options.sourcePaths;
    this.sharedDependencies = options.sharedDependencies;
    this.watchMode = options.watch ?? true;
    this.shouldSkipTypecheck = options.shouldSkipTypecheck;
    this.handleFileBuilt = options.handleFileBuilt;
    this.handleBuildError = options.handleBuildError;
  }

  getSharedDependenciesBuildContext(): SharedDependenciesBuildContext | null {
    return this.sharedDependenciesBuildContext;
  }

  shouldRestart(
    sourcePaths: string[],
    sharedDependencies: FrontComponentSharedDependenciesManifest | undefined,
  ): boolean {
    return (
      (this.componentsWatcher?.shouldRestart(sourcePaths) ?? true) ||
      this.hasSharedDependenciesManifestChanged(sharedDependencies)
    );
  }

  async start(): Promise<void> {
    if (isDefined(this.sharedDependencies)) {
      await this.requestSharedDependenciesBuild();
      await this.startInstalledDependenciesWatcher();
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
            getSharedDependenciesBuildContext: () =>
              this.sharedDependenciesBuildContext,
          }),
          createStubTwentySdkDefinePlugin(),
        ],
      },
    });

    await this.componentsWatcher.start();
  }

  async restart(
    sourcePaths: string[],
    sharedDependencies: FrontComponentSharedDependenciesManifest | undefined,
  ): Promise<void> {
    this.isApplyingRestart = true;

    try {
      const hasSharedDependenciesManifestChanged =
        this.hasSharedDependenciesManifestChanged(sharedDependencies);

      this.sourcePaths = sourcePaths;

      if (hasSharedDependenciesManifestChanged) {
        this.sharedDependenciesBuildGeneration += 1;
        this.hasSharedDependenciesBuildRequestedDuringInFlightBuild = false;
        await this.inFlightSharedDependenciesBuildPromise;
        await this.installedDependenciesWatcher?.close();
        this.installedDependenciesWatcher = null;
        this.sharedDependencies = sharedDependencies;
        this.sharedDependenciesBuildContext = null;
        this.lastSharedDependenciesChecksum = null;

        if (isDefined(sharedDependencies)) {
          await this.requestSharedDependenciesBuild();
          await this.startInstalledDependenciesWatcher();
        }
      }

      await this.componentsWatcher?.restart(sourcePaths);
    } finally {
      this.isApplyingRestart = false;
    }
  }

  async close(): Promise<void> {
    this.isClosed = true;
    await this.installedDependenciesWatcher?.close();
    this.installedDependenciesWatcher = null;
    await this.componentsWatcher?.close();
    this.componentsWatcher = null;
  }

  private hasSharedDependenciesManifestChanged(
    sharedDependencies: FrontComponentSharedDependenciesManifest | undefined,
  ): boolean {
    if (!isDefined(sharedDependencies) || !isDefined(this.sharedDependencies)) {
      return (
        isDefined(sharedDependencies) !== isDefined(this.sharedDependencies)
      );
    }

    return (
      sharedDependencies.dependencies.join(',') !==
      this.sharedDependencies.dependencies.join(',')
    );
  }

  private async requestSharedDependenciesBuild(): Promise<void> {
    if (isDefined(this.inFlightSharedDependenciesBuildPromise)) {
      this.hasSharedDependenciesBuildRequestedDuringInFlightBuild = true;

      return;
    }

    this.inFlightSharedDependenciesBuildPromise =
      this.runSharedDependenciesBuild();

    try {
      await this.inFlightSharedDependenciesBuildPromise;
    } finally {
      this.inFlightSharedDependenciesBuildPromise = null;

      if (this.hasSharedDependenciesBuildRequestedDuringInFlightBuild) {
        this.hasSharedDependenciesBuildRequestedDuringInFlightBuild = false;

        await this.requestSharedDependenciesBuild();
      }
    }
  }

  private async runSharedDependenciesBuild(): Promise<void> {
    const sharedDependencies = this.sharedDependencies;
    const generation = this.sharedDependenciesBuildGeneration;

    if (!isDefined(sharedDependencies)) {
      return;
    }

    const isObsolete = () =>
      this.isClosed || generation !== this.sharedDependenciesBuildGeneration;

    try {
      let builtChecksum: string | null = null;

      const sharedDependenciesBuildContext =
        await buildSharedDependenciesBundle({
          appPath: this.appPath,
          sharedDependencies,
          onFileBuilt: async (event) => {
            builtChecksum = event.checksum;

            if (
              isObsolete() ||
              event.checksum === this.lastSharedDependenciesChecksum
            ) {
              return;
            }

            await this.handleFileBuilt(event);
          },
        });

      if (isObsolete()) {
        return;
      }

      this.sharedDependenciesBuildContext = sharedDependenciesBuildContext;

      if (builtChecksum !== this.lastSharedDependenciesChecksum) {
        this.lastSharedDependenciesChecksum = builtChecksum;

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

  private async startInstalledDependenciesWatcher(): Promise<void> {
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

    this.installedDependenciesWatcher = chokidar.watch(watchedPaths, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.installedDependenciesWatcher.on('all', (event) => {
      if (event === 'add' || event === 'change') {
        void this.requestSharedDependenciesBuild();
      }
    });
  }
}
