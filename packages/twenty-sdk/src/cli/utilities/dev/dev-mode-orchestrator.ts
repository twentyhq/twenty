import { createLogger } from '@/cli/utilities/build/common/logger';
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

const logger = createLogger('dev-mode');

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

  async handleChangeDetected(filePath: string) {
    this.uiStateManager.addEvent({
      filePath,
      message: `Change detected: ${filePath}`,
      status: 'info',
    });
    this.uiStateManager.updateFileStatus(filePath, 'building');
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
      logger.error(`  ${error}`);
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
    logger.success(`✓ Successfully built ${filePath}`);
    this.uiStateManager.addEvent({
      filePath,
      message: `Successfully built ${builtPath}`,
      status: 'success',
    });
    this.uiStateManager.updateFileStatus(filePath, 'built');

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
          logger.success(`Successfully uploaded ${builtPath}`);
        } else {
          logger.error(`Failed to upload ${builtPath}: ${result.error}`);
        }
      })
      .catch((error) => {
        logger.error(`Upload failed for ${builtPath}: ${error}`);
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
        status: 'building',
        manifestError: null,
        syncError: null,
      });

      const result = await runManifestBuild(this.appPath);

      if (result.error || !result.manifest) {
        this.uiStateManager.updateManifestState({
          status: 'error',
          manifestError: result.error ?? 'Unknown error',
          syncError: null,
        });
        this.uiStateManager.addEvent({
          message: result.error ?? 'Unknown error',
          status: 'error',
        });
        return;
      }

      const validation = validateManifest(result.manifest);

      if (!validation.isValid) {
        const messages = validation.errors
          .map((e) => `  • ${e.path}: ${e.message}`)
          .join('\n');
        logger.error(`Invalid manifest:\n${messages}`);

        return;
      }

      if (validation.warnings.length > 0) {
        for (const warning of validation.warnings) {
          const path = warning.path ? `${warning.path}: ` : '';
          logger.warn(`⚠ ${path}${warning.message}`);
        }
      }

      this.uiStateManager.updateManifestState({
        status: 'built',
        manifestError: null,
        syncError: null,
      });
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
        status: 'syncing',
        manifestError: null,
        syncError: null,
      });
      const syncResult = await this.apiService.syncApplication(manifest);

      if (syncResult.success) {
        this.uiStateManager.addEvent({
          message: '✓ Synced',
          status: 'success',
        });
        this.uiStateManager.updateManifestState({
          status: 'synced',
          manifestError: null,
          syncError: null,
        });
      } else {
        this.uiStateManager.addEvent({
          message: `Sync failed: ${JSON.stringify(syncResult.error, null, 2)}`,
          status: 'error',
        });
        this.uiStateManager.updateManifestState({
          status: 'error',
          manifestError: null,
          syncError: JSON.stringify(syncResult.error, null, 2),
        });
      }
    } catch (error) {
      this.uiStateManager.addEvent({
        message: `Sync failed: ${JSON.stringify(error, null, 2)}`,
        status: 'error',
      });
      this.uiStateManager.updateManifestState({
        status: 'error',
        manifestError: null,
        syncError: JSON.stringify(error, null, 2),
      });
    } finally {
      this.isSyncing = false;
    }
  }
}
