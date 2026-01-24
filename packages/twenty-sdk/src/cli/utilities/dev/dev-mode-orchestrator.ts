import {
  EMPTY_ENTITIES,
  type ManifestBuildResult,
  type ManifestEntities,
  updateManifestChecksum,
} from '@/cli/utilities/build/manifest/manifest-build';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { ApiService } from '@/cli/utilities/api/api-service';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { type ApplicationManifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { devUIState } from './dev-ui-state';

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
  private entities: ManifestEntities = EMPTY_ENTITIES;
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
  onChangeDetected(filePath?: string): void {
    this.cancelPendingSync();
    this.isManifestReady = false;
    if (filePath) {
      devUIState.fileBuilding(filePath);
    }
  }

  /**
   * Called when the manifest build completes.
   */
  onManifestBuilt(result: ManifestBuildResult, filePath?: string): void {
    if (!result.manifest) {
      devUIState.manifestError('Build failed');
      return;
    }

    this.manifest = result.manifest;
    this.entities = result.entities;
    this.isManifestReady = true;

    // Update UI with manifest info
    devUIState.manifestReady(result, filePath);

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
  async onFileBuilt(
    type: 'function' | 'frontComponent',
    builtPath: string,
    filePath: string,
    checksum: string,
  ): Promise<void> {
    const fileFolder =
      type === 'function'
        ? FileFolder.BuiltFunction
        : FileFolder.BuiltFrontComponent;

    // Update UI state to 'built'
    devUIState.fileBuilt(filePath);

    if (this.fileUploader) {
      this.uploadFile(builtPath, fileFolder);
    }

    // Update manifest checksum (internal data only, no UI state change needed)
    if (this.manifest) {
      devUIState.manifestBuilding();
      const updated = updateManifestChecksum({
        manifest: this.manifest,
        entityType: type,
        builtPath,
        checksum,
      });
      if (updated) {
        this.manifest = updated;
      }
      devUIState.manifestReady({
        manifest: this.manifest,
        entities: this.entities,
      });
    }

    // Reschedule sync (debounce)
    this.scheduleSync();
  }

  /**
   * Gets current entities with source paths (used by app-dev to manage watchers).
   */
  getEntities(): ManifestEntities {
    return this.entities;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private methods
  // ─────────────────────────────────────────────────────────────────────────

  private uploadFile(builtPath: string, fileFolder: FileFolder): void {
    devUIState.fileUploading(builtPath);

    const uploadPromise = this.fileUploader!.uploadFile({
      builtPath,
      fileFolder,
    })
      .then(() => {
        devUIState.fileUploaded(builtPath);
      })
      .catch((error) => {
        const errorMsg = error instanceof Error ? error.message : String(error);
        devUIState.fileUploadError(builtPath, errorMsg);
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

      devUIState.syncing();
      // Step 3: Sync with API
      const result = await this.apiService.syncApplication(manifestToSync);

      if (result.success) {
        devUIState.synced();
      } else {
        const errorMsg = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error)
          : 'Unknown error';
        devUIState.syncError(errorMsg);
      }
    } finally {
      this.isSyncing = false;
    }
  }
}
