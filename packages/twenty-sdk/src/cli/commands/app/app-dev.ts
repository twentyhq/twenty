import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';
import { createLogger } from '@/cli/utilities/build/common/logger';
import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import { runManifestBuild, type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-build';
import { ManifestWatcher } from '@/cli/utilities/build/manifest/manifest-watcher';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import * as fs from 'fs-extra';
import path from 'path';

const initLogger = createLogger('init');

export type AppDevOptions = {
  appPath?: string;
};

export type FileStatus = {
  builtPath: string;
  checksum: string | null;
  isUploaded: boolean;
};

export type FileUploadStatus = {
  functions: Map<string, FileStatus>;
  frontComponents: Map<string, FileStatus>;
};

type AppDevState = {
  manifestBuildResult: ManifestBuildResult | null;
  fileUploadStatus: FileUploadStatus;
};

export class AppDevCommand {
  private manifestWatcher: ManifestWatcher | null = null;
  private functionsWatcher: FunctionsWatcher | null = null;
  private frontComponentsWatcher: FrontComponentsWatcher | null = null;

  private appPath: string = '';
  private state: AppDevState = {
    manifestBuildResult: null,
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
    const manifestBuildResult = await runManifestBuild(this.appPath);

    if (!manifestBuildResult.manifest) {
      return;
    }

    this.state.manifestBuildResult = manifestBuildResult;
    this.initializeFileUploadStatus(manifestBuildResult);

    await this.startManifestWatcher();
    await this.startFunctionsWatcher(manifestBuildResult);
    await this.startFrontComponentsWatcher(manifestBuildResult);
  }

  private initializeFileUploadStatus(manifestBuildResult: ManifestBuildResult): void {
    this.state.fileUploadStatus.functions.clear();
    this.state.fileUploadStatus.frontComponents.clear();

    for (const fn of manifestBuildResult.manifest?.serverlessFunctions ?? []) {
      this.state.fileUploadStatus.functions.set(fn.universalIdentifier, {
        builtPath: fn.builtHandlerPath,
        checksum: null,
        isUploaded: false,
      });
    }

    for (const component of manifestBuildResult.manifest?.frontComponents ?? []) {
      this.state.fileUploadStatus.frontComponents.set(component.universalIdentifier, {
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
          this.state.manifestBuildResult = result;
          this.initializeFileUploadStatus(result);

          if (this.functionsWatcher?.shouldRestart(result)) {
            this.functionsWatcher.restart(result);
          }

          if (this.frontComponentsWatcher?.shouldRestart(result)) {
            this.frontComponentsWatcher.restart(result);
          }
        },
      },
    });

    await this.manifestWatcher.start();
  }

  private async startFunctionsWatcher(manifestBuildResult: ManifestBuildResult): Promise<void> {
    this.functionsWatcher = new FunctionsWatcher({
      appPath: this.appPath,
      buildResult: manifestBuildResult,
      onFileBuilt: (builtPath, checksum) => {
        this.updateFunctionFileStatus(builtPath, checksum);
      },
    });

    await this.functionsWatcher.start();
  }

  private async startFrontComponentsWatcher(manifestBuildResult: ManifestBuildResult): Promise<void> {
    this.frontComponentsWatcher = new FrontComponentsWatcher({
      appPath: this.appPath,
      buildResult: manifestBuildResult,
      onFileBuilt: (builtPath, checksum) => {
        this.updateFrontComponentFileStatus(builtPath, checksum);
      },
    });

    await this.frontComponentsWatcher.start();
  }

  private updateFunctionFileStatus(builtPath: string, checksum: string): void {
    for (const [_id, status] of this.state.fileUploadStatus.functions) {
      if (status.builtPath === builtPath) {
        status.checksum = checksum;
        status.isUploaded = false;
        break;
      }
    }

    // Update the manifest with the checksum
    const manifest = this.state.manifestBuildResult?.manifest;
    if (manifest) {
      const fn = manifest.serverlessFunctions.find(
        (f) => f.builtHandlerPath === builtPath,
      );
      if (fn) {
        fn.builtHandlerChecksum = checksum;
        this.writeManifestToOutput();
      }
    }
  }

  private updateFrontComponentFileStatus(builtPath: string, checksum: string): void {
    for (const [_id, status] of this.state.fileUploadStatus.frontComponents) {
      if (status.builtPath === builtPath) {
        status.checksum = checksum;
        status.isUploaded = false;
        break;
      }
    }

    // Update the manifest with the checksum
    const manifest = this.state.manifestBuildResult?.manifest;
    if (manifest) {
      const component = manifest.frontComponents?.find(
        (c) => c.builtComponentPath === builtPath,
      );
      if (component) {
        component.builtComponentChecksum = checksum;
        this.writeManifestToOutput();
      }
    }
  }

  private async writeManifestToOutput(): Promise<void> {
    const manifest = this.state.manifestBuildResult?.manifest;
    if (!manifest) return;

    const outputDir = path.join(this.appPath, OUTPUT_DIR);
    const manifestPath = path.join(outputDir, 'manifest.json');
    await fs.writeJSON(manifestPath, manifest, { spaces: 2 });
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
