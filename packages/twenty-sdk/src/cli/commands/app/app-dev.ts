import { createLogger } from '@/cli/utilities/build/common/logger';
import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import {
  type ManifestBuildResult,
  runManifestBuild,
  updateManifestChecksum,
} from '@/cli/utilities/build/manifest/manifest-build';
import { ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { type ApplicationManifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

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
  private functionsWatcher: FunctionsWatcher | null = null;
  private frontComponentsWatcher: FrontComponentsWatcher | null = null;

  private fileUploader: FileUploader;

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

    this.fileUploader = new FileUploader({
      appPath: this.appPath,
      applicationUniversalIdentifier:
        buildResult.manifest.application.universalIdentifier,
    });

    this.state.manifest = buildResult.manifest;
    this.initializeFunctionsFileUploadStatus(buildResult.manifest);
    this.initializeFrontComponentsFileUploadStatus(buildResult.manifest);

    await this.startManifestWatcher();
    await this.startFunctionsWatcher(buildResult.filePaths.functions);
    await this.startFrontComponentsWatcher(
      buildResult.filePaths.frontComponents,
    );
  }

  private initializeFunctionsFileUploadStatus(
    manifest: ApplicationManifest,
  ): void {
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

  private initializeFrontComponentsFileUploadStatus(
    manifest: ApplicationManifest,
  ): void {
    this.state.fileStatusMaps.frontComponents.clear();

    for (const component of manifest.frontComponents ?? []) {
      this.state.fileStatusMaps.frontComponents.set(
        component.universalIdentifier,
        {
          sourcePath: component.sourceComponentPath,
          builtPath: component.builtComponentPath,
          checksum: null,
          isUploaded: false,
        },
      );
    }
  }

  private async startManifestWatcher(): Promise<void> {
    this.manifestWatcher = new ManifestWatcher({
      appPath: this.appPath,
      callbacks: {
        onBuildSuccess: this.onManifestBuild,
      },
    });

    await this.manifestWatcher.start();
  }

  private async onManifestBuild(result: ManifestBuildResult) {
    this.state.manifest = result.manifest;

    const functionSourcePaths = result.filePaths.functions;
    const shouldRestartFunctions =
      this.functionsWatcher?.shouldRestart(functionSourcePaths);
    if (shouldRestartFunctions) {
      if (result.manifest) {
        this.initializeFunctionsFileUploadStatus(result.manifest);
      }
      this.functionsWatcher?.restart(functionSourcePaths);
    }

    const componentSourcePaths = result.filePaths.frontComponents;
    const shouldRestartFrontComponents =
      this.frontComponentsWatcher?.shouldRestart(componentSourcePaths);
    if (shouldRestartFrontComponents) {
      if (result.manifest) {
        this.initializeFrontComponentsFileUploadStatus(result.manifest);
      }
      this.frontComponentsWatcher?.restart(componentSourcePaths);
    }
  }

  private async startFunctionsWatcher(sourcePaths: string[]): Promise<void> {
    this.functionsWatcher = new FunctionsWatcher({
      appPath: this.appPath,
      sourcePaths,
      onFileBuilt: async (builtPath, checksum) => {
        await this.updateFileStatus('function', builtPath, checksum);
        await this.fileUploader.uploadFile({
          builtPath,
          fileFolder: FileFolder.BuiltFunction,
        });
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
      onFileBuilt: async (builtPath, checksum) => {
        await this.updateFileStatus('frontComponent', builtPath, checksum);
        await this.fileUploader.uploadFile({
          builtPath,
          fileFolder: FileFolder.BuiltFrontComponent,
        });
      },
    });

    await this.frontComponentsWatcher.start();
  }

  private async updateFileStatus(
    entityType: 'function' | 'frontComponent',
    builtPath: string,
    checksum: string,
  ): Promise<void> {
    const statusMap =
      entityType === 'function'
        ? this.state.fileStatusMaps.functions
        : this.state.fileStatusMaps.frontComponents;

    for (const [_id, status] of statusMap) {
      if (status.builtPath === builtPath) {
        status.checksum = checksum;
        status.isUploaded = false;
        break;
      }
    }

    const manifest = this.state.manifest;
    if (manifest) {
      const updatedManifest = updateManifestChecksum({
        manifest,
        entityType,
        builtPath,
        checksum,
      });
      if (updatedManifest) {
        this.state.manifest = updatedManifest;
        await writeManifestToOutput(this.appPath, updatedManifest);
      }
    }
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
