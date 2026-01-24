import { createLogger } from '@/cli/utilities/build/common/logger';
import {
  EMPTY_FILE_PATHS,
  type EntityFilePaths,
  type ManifestBuildResult,
  updateManifestChecksum,
} from '@/cli/utilities/build/manifest/manifest-build';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { ApiService } from '@/cli/utilities/api/api-service';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { type ApplicationManifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

const logger = createLogger('orchestrator');

export type DevModeOrchestratorOptions = {
  appPath: string;
  /**
   * Time in ms to wait after the last file build before syncing.
   * This allows multiple rapid file changes to be batched together.
   * Default: 200ms
   */
  debounceMs?: number;
};

/**
 * DevModeOrchestrator coordinates dev mode: building, uploading, and syncing.
 *
 * Simplified flow:
 * 1. File changes → ManifestWatcher rebuilds manifest
 * 2. esbuild rebuilds affected files → uploads immediately
 * 3. After debounce time (no more changes), sync with API
 * 4. Wait for any in-flight uploads before syncing
 */
export class DevModeOrchestrator {
  private appPath: string;
  private debounceMs: number;

  // Current state
  private manifest: ApplicationManifest | null = null;
  private filePaths: EntityFilePaths = EMPTY_FILE_PATHS;
  private isManifestReady = false;

  // Services
  private fileUploader: FileUploader | null = null;
  private apiService = new ApiService();

  // Upload tracking - single mechanism for all uploads
  private activeUploads = new Set<Promise<void>>();

  // Sync state
  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;

  constructor(options: DevModeOrchestratorOptions) {
    this.appPath = options.appPath;
    this.debounceMs = options.debounceMs ?? 200;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Called when a file change is detected. Resets the sync timer.
   */
  onChangeDetected(): void {
    this.cancelPendingSync();
    this.isManifestReady = false;
  }

  /**
   * Called when the manifest build completes.
   */
  onManifestBuilt(result: ManifestBuildResult): void {
    if (!result.manifest) {
      logger.error('Manifest build failed');
      return;
    }

    this.manifest = result.manifest;
    this.filePaths = result.filePaths;
    this.isManifestReady = true;

    // Initialize file uploader on first successful manifest
    if (!this.fileUploader) {
      this.fileUploader = new FileUploader({
        appPath: this.appPath,
        applicationUniversalIdentifier:
          result.manifest.application.universalIdentifier,
      });
    }

    // Schedule sync (will be debounced if more file builds come in)
    this.scheduleSync();
  }

  /**
   * Called when a file is built by esbuild.
   * Uploads immediately and schedules a sync.
   */
  onFileBuilt(
    type: 'function' | 'frontComponent',
    builtPath: string,
    checksum: string,
  ): void {
    const fileFolder =
      type === 'function'
        ? FileFolder.BuiltFunction
        : FileFolder.BuiltFrontComponent;

    // Upload immediately
    if (this.fileUploader) {
      this.uploadFile(builtPath, fileFolder);
    }

    // Update manifest checksum
    if (this.manifest) {
      const updated = updateManifestChecksum({
        manifest: this.manifest,
        entityType: type,
        builtPath,
        checksum,
      });
      if (updated) {
        this.manifest = updated;
      }
    }

    // Reschedule sync (debounce)
    this.scheduleSync();
  }

  /**
   * Gets current file paths (used by app-dev to manage watchers).
   */
  getFilePaths(): EntityFilePaths {
    return this.filePaths;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private methods
  // ─────────────────────────────────────────────────────────────────────────

  private uploadFile(builtPath: string, fileFolder: FileFolder): void {
    const uploadPromise = this.fileUploader!.uploadFile({
      builtPath,
      fileFolder,
    })
      .catch((error) => {
        logger.error(
          `Upload failed for ${builtPath}: ${error instanceof Error ? error.message : error}`,
        );
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
    // Wait for manifest to be ready
    if (!this.isManifestReady || !this.manifest) {
      return;
    }

    // Prevent concurrent syncs
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;

    try {
      // Deep copy manifest to prevent mutations during async operations
      const manifestToSync: ApplicationManifest = JSON.parse(
        JSON.stringify(this.manifest),
      );

      // Step 1: Write manifest to disk
      await writeManifestToOutput(this.appPath, manifestToSync);

      // Step 2: Wait for all uploads to complete
      while (this.activeUploads.size > 0) {
        await Promise.all(this.activeUploads);
      }

      // Step 3: Sync with API
      const result = await this.apiService.syncApplication(manifestToSync);

      if (result.success) {
        logger.success('✓ Synced');
      } else {
        logger.error(`✗ Sync failed: ${result.error}`);
      }
    } finally {
      this.isSyncing = false;
    }
  }
}
