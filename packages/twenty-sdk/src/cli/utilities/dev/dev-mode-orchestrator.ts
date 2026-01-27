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
import { type UiStateManager } from '@/cli/utilities/ui/ui-state-manager';
import { relative } from 'path';
import { type EventName } from 'chokidar/handler.js';

export type DevModeOrchestratorOptions = {
  appPath: string;
  debounceMs?: number;
  handleManifestBuilt: (result: ManifestBuildResult) => void | Promise<void>;
  uiStateManager: UiStateManager;
};

export class DevModeOrchestrator {
  private appPath: string;
  private debounceMs: number;

  private builtFileInfos = new Map<
    string,
    {
      checksum: string;
      builtPath: string;
      filePath: string;
      fileFolder: FileFolder;
    }
  >();

  private fileUploader: FileUploader | null = null;
  private apiService = new ApiService();

  private activeUploads = new Set<Promise<void>>();

  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private uiStateManager: UiStateManager;

  private handleManifestBuilt: (
    result: ManifestBuildResult,
  ) => void | Promise<void>;

  constructor(options: DevModeOrchestratorOptions) {
    this.appPath = options.appPath;
    this.debounceMs = options.debounceMs ?? 200;
    this.handleManifestBuilt = options.handleManifestBuilt;
    this.uiStateManager = options.uiStateManager;
  }

  async handleChangeDetected(filePath: string, event: EventName) {
    const normalizedFilePath = this.normalizeFilePath(filePath);
    this.uiStateManager.addEvent({
      filePath: normalizedFilePath,
      message: `Change detected: ${normalizedFilePath}`,
      status: 'info',
    });
    if (event === 'unlink') {
      this.uiStateManager.removeEntity(normalizedFilePath);
    } else {
      this.uiStateManager.updateFileStatus(normalizedFilePath, 'building');
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
        filePath: error.location?.file,
        message: error.error,
        status: 'error',
      });
    }
  }

  handleFileBuilt({
    fileFolder,
    builtPath,
    filePath,
    checksum,
  }: {
    fileFolder: FileFolder;
    builtPath: string;
    filePath: string;
    checksum: string;
  }): void {
    this.uiStateManager.addEvent({
      filePath,
      message: `Successfully built ${builtPath}`,
      status: 'success',
    });

    this.builtFileInfos.set(builtPath, {
      checksum,
      builtPath,
      filePath,
      fileFolder,
    });

    if (this.fileUploader) {
      this.uploadFile(builtPath, filePath, fileFolder);
    }

    this.scheduleSync();
  }

  private normalizeFilePath(filePath: string): string {
    return relative(this.appPath, filePath);
  }

  private uploadFile(
    builtPath: string,
    filePath: string,
    fileFolder: FileFolder,
  ): void {
    this.uiStateManager.addEvent({
      filePath,
      message: `Uploading ${builtPath}`,
      status: 'info',
    });
    this.uiStateManager.updateFileStatus(filePath, 'uploading');
    const uploadPromise = this.fileUploader!.uploadFile({
      builtPath,
      fileFolder,
    })
      .then((result) => {
        if (result.success) {
          this.uiStateManager.addEvent({
            filePath,
            message: `Successfully uploaded ${builtPath}`,
            status: 'success',
          });
          this.uiStateManager.updateFileStatus(filePath, 'success');
        } else {
          this.uiStateManager.addEvent({
            filePath,
            message: `Failed to upload ${builtPath}: ${result.error}`,
            status: 'error',
          });
        }
      })
      .catch((error) => {
        this.uiStateManager.addEvent({
          filePath,
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

      if (!validation.isValid) {
        for (const e of validation.errors) {
          this.uiStateManager.addEvent({
            message: `${e.path}: ${e.message}`,
            status: 'error',
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
          { fileFolder, filePath },
        ] of this.builtFileInfos.entries()) {
          this.uploadFile(builtPath, filePath, fileFolder);
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
