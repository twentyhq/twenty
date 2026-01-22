import { AssetsWatcher, type BuiltAsset } from '@/cli/utilities/build/assets/assets-watcher';
import { createLogger } from '@/cli/utilities/build/common/logger';
import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import {
  runManifestBuild,
  updateManifestAssets,
  updateManifestChecksum,
} from '@/cli/utilities/build/manifest/manifest-build';
import { ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { type ApplicationManifest } from 'twenty-shared/application';

const initLogger = createLogger('init');

export type AppDevOptions = {
  appPath?: string;
};

export type FileStatus = {
  sourcePath: string;
  builtPath: string;
  checksum: string | null;
  isUploaded: boolean;
};

export type FileStatusMaps = {
  functions: Map<string, FileStatus>;
  frontComponents: Map<string, FileStatus>;
};

type AppDevState = {
  manifest: ApplicationManifest | null;
  fileStatusMaps: FileStatusMaps;
};

export class AppDevCommand {
  private manifestWatcher: ManifestWatcher | null = null;
  private assetsWatcher: AssetsWatcher | null = null;
  private functionsWatcher: FunctionsWatcher | null = null;
  private frontComponentsWatcher: FrontComponentsWatcher | null = null;

  private appPath: string = '';
  private state: AppDevState = {
    manifest: null,
    fileStatusMaps: {
      functions: new Map(),
      frontComponents: new Map(),
    },
  };

  async execute(options: AppDevOptions): Promise<void> {
    this.appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    initLogger.log('🚀 Starting Twenty Application Development Mode');
    initLogger.log(`📁 App Path: ${this.appPath}`);
    console.log('');

    await this.startWatchers();

    this.setupGracefulShutdown();
  }

  private async startWatchers(): Promise<void> {
    const buildResult = await runManifestBuild(this.appPath);

    if (!buildResult.manifest) {
      return;
    }

    this.state.manifest = buildResult.manifest;
    this.initializeFunctionsFileUploadStatus(buildResult.manifest);
    this.initializeFrontComponentsFileUploadStatus(buildResult.manifest);

    // Start assets watcher first so assets are available for other watchers
    await this.startAssetsWatcher();
    await this.startManifestWatcher();
    await this.startFunctionsWatcher(buildResult.filePaths.functions);
    await this.startFrontComponentsWatcher(buildResult.filePaths.frontComponents);
  }

  private initializeFunctionsFileUploadStatus(manifest: ApplicationManifest): void {
    this.state.fileStatusMaps.functions.clear();

    for (const fn of manifest.functions ?? []) {
      this.state.fileStatusMaps.functions.set(fn.universalIdentifier, {
        sourcePath: fn.sourceHandlerPath,
        builtPath: fn.builtHandlerPath,
        checksum: null,
        isUploaded: false,
      });
    }
  }

  private initializeFrontComponentsFileUploadStatus(manifest: ApplicationManifest): void {
    this.state.fileStatusMaps.frontComponents.clear();

    for (const component of manifest.frontComponents ?? []) {
      this.state.fileStatusMaps.frontComponents.set(component.universalIdentifier, {
        sourcePath: component.sourceComponentPath,
        builtPath: component.builtComponentPath,
        checksum: null,
        isUploaded: false,
      });
    }
  }

  private async startAssetsWatcher(): Promise<void> {
    this.assetsWatcher = new AssetsWatcher({
      appPath: this.appPath,
      watch: true,
    });

    await this.assetsWatcher.start();
  }

  private async startManifestWatcher(): Promise<void> {
    this.manifestWatcher = new ManifestWatcher({
      appPath: this.appPath,
      callbacks: {
        onBuildSuccess: (result) => {
          this.state.manifest = result.manifest;

          const functionSourcePaths = result.filePaths.functions;
          const shouldRestartFunctions = this.functionsWatcher?.shouldRestart(functionSourcePaths);
          if (shouldRestartFunctions) {
            if (result.manifest) {
              this.initializeFunctionsFileUploadStatus(result.manifest);
            }
            this.functionsWatcher?.restart(functionSourcePaths);
          }

          const componentSourcePaths = result.filePaths.frontComponents;
          const shouldRestartFrontComponents = this.frontComponentsWatcher?.shouldRestart(componentSourcePaths);
          if (shouldRestartFrontComponents) {
            if (result.manifest) {
              this.initializeFrontComponentsFileUploadStatus(result.manifest);
            }
            this.frontComponentsWatcher?.restart(componentSourcePaths);
          }
        },
      },
    });

    await this.manifestWatcher.start();
  }

  private async startFunctionsWatcher(sourcePaths: string[]): Promise<void> {
    this.functionsWatcher = new FunctionsWatcher({
      appPath: this.appPath,
      sourcePaths,
      onFileBuilt: (builtPath, checksum, sourceAssetPaths) => {
        this.updateFunctionFileStatus(builtPath, checksum, sourceAssetPaths);
      },
    });

    await this.functionsWatcher.start();
  }

  private async startFrontComponentsWatcher(sourcePaths: string[]): Promise<void> {
    this.frontComponentsWatcher = new FrontComponentsWatcher({
      appPath: this.appPath,
      sourcePaths,
      onFileBuilt: (builtPath, checksum, sourceAssetPaths) => {
        this.updateFrontComponentFileStatus(builtPath, checksum, sourceAssetPaths);
      },
    });

    await this.frontComponentsWatcher.start();
  }

  private updateFunctionFileStatus(
    builtPath: string,
    checksum: string,
    sourceAssetPaths: string[],
  ): void {
    for (const [_id, status] of this.state.fileStatusMaps.functions) {
      if (status.builtPath === builtPath) {
        status.checksum = checksum;
        status.isUploaded = false;
        break;
      }
    }

    const manifest = this.state.manifest;
    if (manifest) {
      let updatedManifest = updateManifestChecksum({
        manifest,
        entityType: 'function',
        builtPath,
        checksum,
      });

      if (updatedManifest && sourceAssetPaths.length > 0) {
        const builtAssets = this.resolveBuiltAssets(sourceAssetPaths);
        updatedManifest = updateManifestAssets({
          manifest: updatedManifest,
          entityType: 'function',
          builtPath,
          assets: builtAssets,
        });
      }

      if (updatedManifest) {
        this.state.manifest = updatedManifest;
        writeManifestToOutput(this.appPath, updatedManifest);
      }
    }
  }

  private updateFrontComponentFileStatus(
    builtPath: string,
    checksum: string,
    sourceAssetPaths: string[],
  ): void {
    for (const [_id, status] of this.state.fileStatusMaps.frontComponents) {
      if (status.builtPath === builtPath) {
        status.checksum = checksum;
        status.isUploaded = false;
        break;
      }
    }

    const manifest = this.state.manifest;
    if (manifest) {
      let updatedManifest = updateManifestChecksum({
        manifest,
        entityType: 'frontComponent',
        builtPath,
        checksum,
      });

      if (updatedManifest && sourceAssetPaths.length > 0) {
        const builtAssets = this.resolveBuiltAssets(sourceAssetPaths);
        updatedManifest = updateManifestAssets({
          manifest: updatedManifest,
          entityType: 'frontComponent',
          builtPath,
          assets: builtAssets,
        });
      }

      if (updatedManifest) {
        this.state.manifest = updatedManifest;
        writeManifestToOutput(this.appPath, updatedManifest);
      }
    }
  }

  private resolveBuiltAssets(sourceAssetPaths: string[]): BuiltAsset[] {
    if (!this.assetsWatcher) {
      return [];
    }

    const builtAssets: BuiltAsset[] = [];

    for (const sourceAssetPath of sourceAssetPaths) {
      const builtAsset = this.assetsWatcher.getBuiltAsset(sourceAssetPath);
      if (builtAsset) {
        builtAssets.push(builtAsset);
      }
    }

    return builtAssets;
  }

  private setupGracefulShutdown(): void {
    const shutdown = () => {
      console.log('');
      initLogger.warn('🛑 Stopping...');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
