import {
  type ManifestBuildResult,
  runManifestBuild,
  updateManifestChecksum,
} from '@/cli/utilities/build/manifest/manifest-build';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { ApiService } from '@/cli/utilities/api/api-service';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { type FileFolder } from 'twenty-shared/types';
import { validateManifest } from '@/cli/utilities/build/manifest/manifest-validate';
import type { Location } from 'esbuild';
import { type DevUiStateManager } from '@/cli/utilities/dev/dev-ui-state-manager';
import { relative } from 'path';
import { type EventName } from 'chokidar/handler.js';

export type DevModeOrchestratorOptions = {
  appPath: string;
  debounceMs?: number;
  handleManifestBuilt: (result: ManifestBuildResult) => void | Promise<void>;
  uiStateManager: DevUiStateManager;
};

export class DevModeOrchestrator {
  private appPath: string;
  private debounceMs: number;

  private builtFileInfos = new Map<
    string,
    {
      checksum: string;
      builtPath: string;
      sourcePath: string;
      fileFolder: FileFolder;
    }
  >();

  private fileUploader: FileUploader | null = null;
  private apiService = new ApiService({ disableInterceptors: true });

  private activeUploads = new Set<Promise<void>>();

  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private uiStateManager: DevUiStateManager;
  private serverChecked = false;
  private serverCheckedLogged = false;

  private handleManifestBuilt: (
    result: ManifestBuildResult,
  ) => void | Promise<void>;

  constructor(options: DevModeOrchestratorOptions) {
    this.appPath = options.appPath;
    this.debounceMs = options.debounceMs ?? 200;
    this.handleManifestBuilt = options.handleManifestBuilt;
    this.uiStateManager = options.uiStateManager;
  }

  private async checkServer(): Promise<void> {
    this.serverChecked = await this.apiService.validateAuth();

    if (!this.serverChecked && !this.serverCheckedLogged) {
      this.uiStateManager.addEvent({
        message:
          'Please check your server is up and your credentials are correct: "yarn auth:login"',
        status: 'error',
      });
      this.uiStateManager.updateManifestState({
        manifestStatus: 'error',
      });
      this.serverCheckedLogged = true;
    }
  }

  async handleChangeDetected(sourcePath: string, event: EventName) {
    if (!this.serverChecked) {
      await this.checkServer();
    }

    if (!this.serverChecked) {
      return;
    }

    const normalizedSourcePath = this.normalizeFilePath(sourcePath);

    this.uiStateManager.addEvent({
      message: `Change detected: ${normalizedSourcePath}`,
      status: 'info',
    });

    if (event === 'unlink') {
      this.uiStateManager.removeEntity(normalizedSourcePath);
    } else {
      this.uiStateManager.updateFileStatus(normalizedSourcePath, 'building');
    }

    this.scheduleSync();
  }

  handleFileBuildError(
    errors: { error: string; location: Location | null }[],
  ): void {
    this.uiStateManager.addEvent({
      message: 'Build failed:',
      status: 'error',
    });
    for (const error of errors) {
      this.uiStateManager.addEvent({
        message: error.error,
        status: 'error',
      });
    }
  }

  handleFileBuilt({
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
    this.uiStateManager.addEvent({
      message: `Successfully built ${builtPath}`,
      status: 'success',
    });

    this.builtFileInfos.set(builtPath, {
      checksum,
      builtPath,
      sourcePath,
      fileFolder,
    });

    if (this.fileUploader) {
      this.uploadFile(builtPath, sourcePath, fileFolder);
    }

    this.scheduleSync();
  }

  private normalizeFilePath(filePath: string): string {
    return relative(this.appPath, filePath);
  }

  private uploadFile(
    builtPath: string,
    sourcePath: string,
    fileFolder: FileFolder,
  ): void {
    this.uiStateManager.addEvent({
      message: `Uploading ${builtPath}`,
      status: 'info',
    });
    this.uiStateManager.updateFileStatus(sourcePath, 'uploading');
    const uploadPromise = this.fileUploader!.uploadFile({
      builtPath,
      fileFolder,
    })
      .then((result) => {
        if (result.success) {
          this.uiStateManager.addEvent({
            message: `Successfully uploaded ${builtPath}`,
            status: 'success',
          });
          this.uiStateManager.updateFileStatus(sourcePath, 'success');
        } else {
          this.uiStateManager.addEvent({
            message: `Failed to upload ${builtPath}: ${result.error}`,
            status: 'error',
          });
        }
      })
      .catch((error) => {
        this.uiStateManager.addEvent({
          message: `Upload failed for ${builtPath}: ${error}`,
          status: 'error',
        });
      })
      .finally(() => {
        this.activeUploads.delete(uploadPromise);
      });

    this.activeUploads.add(uploadPromise);
  }

  private cancelPendingSync(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private scheduleSync(): void {
    this.cancelPendingSync();

    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      void this.performSync();
    }, this.debounceMs);
  }

  private async performSync(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;

    try {
      this.uiStateManager.addEvent({
        message: 'Building manifest',
        status: 'info',
      });
      this.uiStateManager.updateManifestState({
        manifestStatus: 'building',
      });

      const result = await runManifestBuild(this.appPath);

      if (result.error || !result.manifest) {
        this.uiStateManager.updateManifestState({
          manifestStatus: 'error',
        });
        this.uiStateManager.addEvent({
          message: result.error ?? 'Unknown error',
          status: 'error',
        });
        return;
      }

      const validation = validateManifest(result.manifest);

      this.uiStateManager.updateManifestState({
        appName: result.manifest.application.displayName,
      });

      this.uiStateManager.updateAllFilesTypes({
        manifestFilePaths: result.filePaths,
      });

      if (!validation.isValid) {
        for (const e of validation.errors) {
          this.uiStateManager.addEvent({
            message: `${e.path}: ${e.message}`,
            status: 'error',
          });
          this.uiStateManager.updateManifestState({
            manifestStatus: 'error',
          });
        }

        return;
      }

      if (validation.warnings.length > 0) {
        for (const warning of validation.warnings) {
          const path = warning.path ? `${warning.path}: ` : '';
          this.uiStateManager.addEvent({
            message: `⚠ ${path}${warning.message}`,
            status: 'warning',
          });
        }
      }

      this.uiStateManager.addEvent({
        message: 'Successfully built manifest',
        status: 'success',
      });

      await this.handleManifestBuilt(result);

      if (!this.fileUploader) {
        this.fileUploader = new FileUploader({
          appPath: this.appPath,
          applicationUniversalIdentifier:
            result.manifest.application.universalIdentifier,
        });
        for (const [
          builtPath,
          { fileFolder, sourcePath },
        ] of this.builtFileInfos.entries()) {
          this.uploadFile(builtPath, sourcePath, fileFolder);
        }
      }

      while (this.activeUploads.size > 0) {
        await Promise.all(this.activeUploads);
      }

      const manifest = updateManifestChecksum({
        manifest: result.manifest,
        builtFileInfos: this.builtFileInfos,
      });
      this.uiStateManager.addEvent({
        message: 'Manifest checksums set',
        status: 'info',
      });

      await writeManifestToOutput(this.appPath, manifest);

      this.uiStateManager.addEvent({
        message: 'Manifest saved to output directory',
        status: 'info',
      });

      this.uiStateManager.addEvent({
        message: 'Syncing manifest',
        status: 'info',
      });
      this.uiStateManager.updateManifestState({
        manifestStatus: 'syncing',
      });
      const syncResult = await this.apiService.syncApplication(manifest);

      this.uiStateManager.updateAllFilesStatus('success');

      if (syncResult.success) {
        this.uiStateManager.addEvent({
          message: '✓ Synced',
          status: 'success',
        });
        this.uiStateManager.updateManifestState({
          manifestStatus: 'synced',
        });
      } else {
        this.uiStateManager.addEvent({
          message: `Sync failed: ${JSON.stringify(syncResult.error, null, 2)}`,
          status: 'error',
        });
        this.uiStateManager.updateManifestState({
          manifestStatus: 'error',
        });
      }
    } catch (error) {
      this.uiStateManager.addEvent({
        message: `Sync failed: ${JSON.stringify(error, null, 2)}`,
        status: 'error',
      });
      this.uiStateManager.updateManifestState({
        manifestStatus: 'error',
      });
    } finally {
      this.isSyncing = false;
    }
  }
}
