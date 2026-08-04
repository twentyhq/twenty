import {
  type OnBuildErrorCallback,
  type OnFileBuiltCallback,
} from '@/cli/utilities/build/common/restartable-watcher-interface';
import { buildVendorBundle } from '@/cli/utilities/build/common/vendor-build/build-vendor-bundle';
import { type VendorBuildContext } from '@/cli/utilities/build/common/vendor-build/types/vendor-build-context.type';
import { pathExists } from '@/cli/utilities/file/fs-utils';
import chokidar, { type FSWatcher } from 'chokidar';
import { join } from 'path';
import { type VendorManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const DEPENDENCY_WATCH_PATHS = ['package.json', 'yarn.lock'];

export type VendorBundleWatcherOptions = {
  appPath: string;
  vendor: VendorManifest;
  handleFileBuilt: OnFileBuiltCallback;
  handleBuildError: OnBuildErrorCallback;
  handleVendorRebuilt: () => void | Promise<void>;
};

export class VendorBundleWatcher {
  private appPath: string;
  private vendor: VendorManifest;
  private handleFileBuilt: OnFileBuiltCallback;
  private handleBuildError: OnBuildErrorCallback;
  private handleVendorRebuilt: () => void | Promise<void>;
  private watcher: FSWatcher | null = null;
  private context: VendorBuildContext | null = null;
  private lastChecksum: string | null = null;

  constructor(options: VendorBundleWatcherOptions) {
    this.appPath = options.appPath;
    this.vendor = options.vendor;
    this.handleFileBuilt = options.handleFileBuilt;
    this.handleBuildError = options.handleBuildError;
    this.handleVendorRebuilt = options.handleVendorRebuilt;
  }

  getContext(): VendorBuildContext | null {
    return this.context;
  }

  shouldRestart(vendor: VendorManifest | undefined): boolean {
    if (!isDefined(vendor)) {
      return true;
    }

    return (
      vendor.sourceVendorPath !== this.vendor.sourceVendorPath ||
      vendor.dependencies.join(',') !== this.vendor.dependencies.join(',')
    );
  }

  async start(): Promise<void> {
    await this.build();
    await this.startDependencyWatcher();
  }

  async close(): Promise<void> {
    await this.watcher?.close();
    this.watcher = null;
  }

  private async build(): Promise<void> {
    try {
      let builtChecksum: string | null = null;

      this.context = await buildVendorBundle({
        appPath: this.appPath,
        vendor: this.vendor,
        onFileBuilt: async (event) => {
          builtChecksum = event.checksum;

          if (event.checksum !== this.lastChecksum) {
            await this.handleFileBuilt(event);
          }
        },
      });

      if (builtChecksum !== this.lastChecksum) {
        this.lastChecksum = builtChecksum;
        await this.handleVendorRebuilt();
      }
    } catch (error) {
      await this.handleBuildError([
        {
          error: error instanceof Error ? error.message : String(error),
          location: null,
        },
      ]);
    }
  }

  // The bundle content depends on the installed dependency versions, not only
  // on the vendor source file, so an install or upgrade has to rebuild it.
  private async startDependencyWatcher(): Promise<void> {
    const watchedPaths = (
      await Promise.all(
        DEPENDENCY_WATCH_PATHS.map(async (watchPath) => {
          const absolutePath = join(this.appPath, watchPath);

          return (await pathExists(absolutePath)) ? absolutePath : null;
        }),
      )
    ).filter(isDefined);

    if (watchedPaths.length === 0) {
      return;
    }

    this.watcher = chokidar.watch(watchedPaths, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('all', (event) => {
      if (event === 'add' || event === 'change') {
        void this.build();
      }
    });
  }
}
