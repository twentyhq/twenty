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

const logger = createLogger('dev-mode');

export type DevModeOrchestratorOptions = {
  appPath: string;
  debounceMs?: number;
  handleManifestBuilt: (result: ManifestBuildResult) => void | Promise<void>;
};

export class DevModeOrchestrator {
  private appPath: string;
  private debounceMs: number;

  private builtFileInfos = new Map<
    string,
    { checksum: string; builtPath: string; fileFolder: FileFolder }
  >();

  private fileUploader: FileUploader | null = null;
  private apiService = new ApiService();

  private activeUploads = new Set<Promise<void>>();

  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;

  private handleManifestBuilt: (
    result: ManifestBuildResult,
  ) => void | Promise<void>;

  constructor(options: DevModeOrchestratorOptions) {
    this.appPath = options.appPath;
    this.debounceMs = options.debounceMs ?? 200;
    this.handleManifestBuilt = options.handleManifestBuilt;
  }

  async handleChangeDetected(filePath: string) {
    logger.log(`File changed: ${filePath}`);
    this.scheduleSync();
  }

  handleFileBuildError(errors: string[]): void {
    logger.error(`Build failed:`);
    for (const error of errors) {
      logger.error(`  ${error}`);
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

    this.builtFileInfos.set(builtPath, { checksum, builtPath, fileFolder });

    if (this.fileUploader) {
      this.uploadFile(builtPath, fileFolder);
    }

    this.scheduleSync();
  }

  private uploadFile(builtPath: string, fileFolder: FileFolder): void {
    logger.log(`Uploading ${builtPath}...`);
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
      logger.log(`Building manifest...`);

      const result = await runManifestBuild(this.appPath);

      if (result.error || !result.manifest) {
        logger.error(
          `Failed to build manifest: ${result.error ?? 'Unknown error'}`,
        );
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

      logger.success(`Successfully built manifest`);

      await this.handleManifestBuilt(result);

      if (!this.fileUploader) {
        this.fileUploader = new FileUploader({
          appPath: this.appPath,
          applicationUniversalIdentifier:
            result.manifest.application.universalIdentifier,
        });
        for (const [
          builtPath,
          { fileFolder },
        ] of this.builtFileInfos.entries()) {
          this.uploadFile(builtPath, fileFolder);
        }
      }

      while (this.activeUploads.size > 0) {
        await Promise.all(this.activeUploads);
      }

      const manifest = updateManifestChecksum({
        manifest: result.manifest,
        builtFileInfos: this.builtFileInfos,
      });

      await writeManifestToOutput(this.appPath, manifest);

      logger.log('Syncing...');
      const syncResult = await this.apiService.syncApplication(manifest);

      if (syncResult.success) {
        logger.success('✓ Synced');
      } else {
        logger.error(
          `✗ Sync failed: ${JSON.stringify(syncResult.error, null, 2)}`,
        );
      }
    } catch (error) {
      logger.error(`✗ Sync failed: ${JSON.stringify(error)}`);
    } finally {
      this.isSyncing = false;
    }
  }
}
