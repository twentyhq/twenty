import { createLogger } from '@/cli/utilities/build/common/logger';
import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import { runManifestBuild, updateManifestChecksum } from '@/cli/utilities/build/manifest/manifest-build';
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

export type FileUploadStatus = {
  functions: Map<string, FileStatus>;
  frontComponents: Map<string, FileStatus>;
};

type AppDevState = {
  manifest: ApplicationManifest | null;
  fileUploadStatus: FileUploadStatus;
};

export class AppDevCommand {
  private manifestWatcher: ManifestWatcher | null = null;
  private functionsWatcher: FunctionsWatcher | null = null;
  private frontComponentsWatcher: FrontComponentsWatcher | null = null;

  private appPath: string = '';
  private state: AppDevState = {
    manifest: null,
    fileUploadStatus: {
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
    this.initializeFileUploadStatus(buildResult.manifest);

    await this.startManifestWatcher();
    await this.startFunctionsWatcher(buildResult.filePaths.functions);
    await this.startFrontComponentsWatcher(buildResult.filePaths.frontComponents);
  }

  private initializeFileUploadStatus(manifest: ApplicationManifest): void {
    this.state.fileUploadStatus.functions.clear();
    this.state.fileUploadStatus.frontComponents.clear();

    for (const fn of manifest.functions ?? []) {
      this.state.fileUploadStatus.functions.set(fn.universalIdentifier, {
        sourcePath: fn.sourceHandlerPath,
        builtPath: fn.builtHandlerPath,
        checksum: null,
        isUploaded: false,
      });
    }

    for (const component of manifest.frontComponents ?? []) {
      this.state.fileUploadStatus.frontComponents.set(component.universalIdentifier, {
        sourcePath: component.sourceComponentPath,
        builtPath: component.builtComponentPath,
        checksum: null,
        isUploaded: false,
      });
    }
  }

  private async startManifestWatcher(): Promise<void> {
    this.manifestWatcher = new ManifestWatcher({
      appPath: this.appPath,
      callbacks: {
        onBuildSuccess: (result) => {
          this.state.manifest = result.manifest;
          if (result.manifest) {
            this.initializeFileUploadStatus(result.manifest);
          }

          const functionSourcePaths = result.filePaths.functions;
          if (this.functionsWatcher?.shouldRestart(functionSourcePaths)) {
            this.functionsWatcher.restart(functionSourcePaths);
          }

          const componentSourcePaths = result.filePaths.frontComponents;
          if (this.frontComponentsWatcher?.shouldRestart(componentSourcePaths)) {
            this.frontComponentsWatcher.restart(componentSourcePaths);
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
      onFileBuilt: (builtPath, checksum) => {
        this.updateFileStatus('function', builtPath, checksum);
      },
    });

    await this.functionsWatcher.start();
  }

  private async startFrontComponentsWatcher(sourcePaths: string[]): Promise<void> {
    this.frontComponentsWatcher = new FrontComponentsWatcher({
      appPath: this.appPath,
      sourcePaths,
      onFileBuilt: (builtPath, checksum) => {
        this.updateFileStatus('frontComponent', builtPath, checksum);
      },
    });

    await this.frontComponentsWatcher.start();
  }

  private updateFileStatus(
    entityType: 'function' | 'frontComponent',
    builtPath: string,
    checksum: string,
  ): void {
    const statusMap = entityType === 'function'
      ? this.state.fileUploadStatus.functions
      : this.state.fileUploadStatus.frontComponents;

    for (const [_id, status] of statusMap) {
      if (status.builtPath === builtPath) {
        status.checksum = checksum;
        status.isUploaded = false;
        break;
      }
    }

    const manifest = this.state.manifest;
    if (manifest) {
      const updatedManifest = updateManifestChecksum({ manifest, entityType, builtPath, checksum });
      if (updatedManifest) {
        this.state.manifest = updatedManifest;
        writeManifestToOutput(this.appPath, updatedManifest);
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
