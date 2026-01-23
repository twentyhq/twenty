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
import { OperationTracker } from '@/cli/utilities/dev/operation-tracker';
import { type ApplicationManifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

const logger = createLogger('orchestrator');

/**
 * Pending file upload information stored until sync is ready.
 */
export type PendingUpload = {
  builtPath: string;
  checksum: string;
  fileFolder: FileFolder;
};

export type DevModeOrchestratorOptions = {
  appPath: string;
  /**
   * Time in ms to wait after receiving file builds before syncing.
   * This allows multiple rapid file builds to be batched together.
   * Default: 200ms
   */
  settleTimeMs?: number;
};

/**
 * DevModeOrchestrator is the central coordinator for dev mode operations.
 *
 * It uses a generation-based approach to handle race conditions:
 * - Each file change triggers a new "generation"
 * - Operations from stale generations are ignored
 * - Sync happens after file builds "settle" (no new builds for settleTimeMs)
 *
 * This prevents issues like:
 * - Manifest syncing before uploads complete
 * - Multiple concurrent syncs overwriting each other
 * - Stale callbacks from cancelled builds triggering unwanted actions
 */
export class DevModeOrchestrator {
  private manifest: ApplicationManifest | null = null;
  private filePaths: EntityFilePaths = EMPTY_FILE_PATHS;
  private tracker: OperationTracker;
  private pendingUploads = new Map<string, PendingUpload>();

  private appPath: string;
  private settleTimeMs: number;
  private fileUploader: FileUploader | null = null;
  private apiService = new ApiService();
  private isSyncing = false;

  // Settle timer for batching file builds
  private settleTimer: NodeJS.Timeout | null = null;
  private hasFilesToBuild = false;
  private filesBuiltCount = 0;

  // Track the changed file path (null means initial build, should check all files)
  private changedFilePath: string | null = null;

  // Track active upload promises so we can wait for them before syncing
  private activeUploads = new Set<Promise<void>>();

  constructor(options: DevModeOrchestratorOptions) {
    this.appPath = options.appPath;
    this.settleTimeMs = options.settleTimeMs ?? 200;
    this.tracker = new OperationTracker();
  }

  /**
   * Gets the current manifest.
   */
  getManifest(): ApplicationManifest | null {
    return this.manifest;
  }

  /**
   * Gets the current file paths.
   */
  getFilePaths(): EntityFilePaths {
    return this.filePaths;
  }

  /**
   * Gets the current generation number.
   * Used by watchers to tag their callbacks.
   */
  getCurrentGeneration(): number {
    return this.tracker.getCurrentGeneration();
  }

  /**
   * Called by ManifestWatcher when any file change is detected.
   * This starts a new generation, cancelling any in-progress work.
   * @param filePath - Optional path of the file that triggered the change.
   *                   If null/undefined, this is an initial build and all files will be checked.
   * @returns The new generation number
   */
  onChangeDetected(filePath?: string): number {
    const generation = this.tracker.startNewGeneration();
    logger.log(`[Gen ${generation}] Change detected, starting new generation`);

    // Store the changed file path (null means initial build)
    this.changedFilePath = filePath ?? null;

    // Clear pending state for new generation
    // Note: We clear pendingUploads (queued but not started) but NOT activeUploads
    // because in-flight uploads should complete - they may have started before
    // this generation change was detected
    this.pendingUploads.clear();
    this.filesBuiltCount = 0;

    // Cancel any pending settle timer
    if (this.settleTimer) {
      clearTimeout(this.settleTimer);
      this.settleTimer = null;
    }

    // Mark what we're waiting for
    // We add both upfront because file watchers may complete before manifest build
    this.tracker.addPending('manifestBuild');
    this.tracker.addPending('fileBuilds');

    return generation;
  }

  /**
   * Called when the manifest build completes.
   * @param generation - The generation when the build started
   * @param result - The manifest build result
   */
  onManifestBuilt(generation: number, result: ManifestBuildResult): void {
    // Check if this is stale
    if (generation !== this.tracker.getCurrentGeneration()) {
      logger.log(
        `[Gen ${generation}] Manifest build completed but stale (current: ${this.tracker.getCurrentGeneration()})`,
      );

      return;
    }

    // Mark manifest build complete
    this.tracker.markComplete('manifestBuild', generation);

    if (!result.manifest) {
      logger.error(`[Gen ${generation}] Manifest build failed`);

      return;
    }

    // Store manifest and file paths
    this.manifest = result.manifest;
    this.filePaths = result.filePaths;

    // Initialize file uploader if needed
    if (!this.fileUploader) {
      this.fileUploader = new FileUploader({
        appPath: this.appPath,
        applicationUniversalIdentifier:
          result.manifest.application.universalIdentifier,
      });
    }

    // Check if there are any files that could be built
    if (this.changedFilePath === null) {
      // Initial build: check all function and front-component files
      this.hasFilesToBuild =
        this.filePaths.functions.length > 0 ||
        this.filePaths.frontComponents.length > 0;
    } else {
      // File change: only check if the changed file is a function or front-component
      this.hasFilesToBuild =
        this.filePaths.functions.includes(this.changedFilePath) ||
        this.filePaths.frontComponents.includes(this.changedFilePath);
    }

    // Determine if we should mark fileBuilds complete:
    // 1. No files to build (changed file is not a function/component)
    // 2. OR files are already being uploaded (esbuild built them before this generation started)
    const filesAlreadyUploading = this.activeUploads.size > 0;

    if (!this.hasFilesToBuild && this.filesBuiltCount === 0) {
      logger.log(
        `[Gen ${generation}] No files to build, marking fileBuilds complete`,
      );
      this.tracker.markComplete('fileBuilds', generation);
    } else if (filesAlreadyUploading) {
      // Files were already built by esbuild before onChangeDetected() was called
      // Mark fileBuilds complete - performSync() will wait for activeUploads
      logger.log(
        `[Gen ${generation}] Files already uploading, marking fileBuilds complete`,
      );
      this.tracker.markComplete('fileBuilds', generation);
    } else {
      // Wait for file builds to arrive and settle
      // (fileBuilds was already added as pending in onChangeDetected)
      logger.log(`[Gen ${generation}] Waiting for file builds to complete...`);
    }

    // Always check if we're ready to sync - the settle timer may have already
    // marked 'fileBuilds' complete before this method was called
    void this.checkReadyToSync(generation);
  }

  /**
   * Called by function/component watchers when a file is built.
   * Uploads the file immediately and uses a settle timer for manifest sync.
   * @param generation - The generation when the build started
   * @param type - The type of file ('function' or 'frontComponent')
   * @param builtPath - The path to the built file
   * @param checksum - The MD5 checksum of the file
   */
  onFileBuilt(
    _generation: number,
    type: 'function' | 'frontComponent',
    builtPath: string,
    checksum: string,
  ): void {
    // Note: We don't check generation here because esbuild's watcher may complete
    // its build before ManifestWatcher calls onChangeDetected(). We always process
    // file builds and let the settle timer batch them together.
    const generation = this.tracker.getCurrentGeneration();

    const fileFolder =
      type === 'function'
        ? FileFolder.BuiltFunction
        : FileFolder.BuiltFrontComponent;

    // Upload immediately if file uploader is available
    if (this.fileUploader) {
      const uploadPromise = this.fileUploader
        .uploadFile({
          builtPath,
          fileFolder,
        })
        .catch((error) => {
          logger.error(
            `[Gen ${generation}] Upload failed for ${builtPath}: ${error instanceof Error ? error.message : error}`,
          );
        })
        .finally(() => {
          // Remove from active uploads when done (success or error)
          this.activeUploads.delete(uploadPromise);
        });

      // Track the upload so we can wait for it before syncing
      this.activeUploads.add(uploadPromise);
    } else {
      // Queue for upload during sync (file uploader not yet initialized)
      this.pendingUploads.set(builtPath, {
        builtPath,
        checksum,
        fileFolder,
      });
    }

    // Update manifest checksum
    if (this.manifest) {
      const updatedManifest = updateManifestChecksum({
        manifest: this.manifest,
        entityType: type,
        builtPath,
        checksum,
      });
      if (updatedManifest) {
        this.manifest = updatedManifest;
      }
    }

    this.filesBuiltCount++;

    // Reset the settle timer - we wait for builds to "settle"
    // before triggering sync
    this.scheduleSettleSync(generation);
  }

  /**
   * Schedules a sync after file builds settle (no new builds for settleTimeMs).
   * @param generation - The generation to sync
   */
  private scheduleSettleSync(generation: number): void {
    // Clear existing timer
    if (this.settleTimer) {
      clearTimeout(this.settleTimer);
    }

    // Set new timer
    this.settleTimer = setTimeout(() => {
      this.settleTimer = null;

      // Verify still current generation
      if (generation !== this.tracker.getCurrentGeneration()) {
        return;
      }

      logger.log(
        `[Gen ${generation}] File builds settled (${this.filesBuiltCount} file(s) built)`,
      );

      // Mark file builds as complete
      this.tracker.markComplete('fileBuilds', generation);

      // Trigger sync
      void this.checkReadyToSync(generation);
    }, this.settleTimeMs);
  }

  /**
   * Checks if all operations are complete and performs sync if ready.
   * @param generation - The generation to check
   */
  private async checkReadyToSync(generation: number): Promise<void> {
    // Verify this is still the current generation
    if (generation !== this.tracker.getCurrentGeneration()) {
      logger.log(
        `[Gen ${generation}] Ready to sync but stale (current: ${this.tracker.getCurrentGeneration()})`,
      );

      return;
    }

    // Check if all operations are complete
    if (!this.tracker.isEmpty()) {
      const pending = this.tracker.getPendingIds();
      logger.log(
        `[Gen ${generation}] Not ready to sync, pending: ${pending.join(', ')}`,
      );

      return;
    }

    // Prevent concurrent syncs
    if (this.isSyncing) {
      logger.log(`[Gen ${generation}] Sync already in progress`);

      return;
    }

    await this.performSync(generation);
  }

  /**
   * Performs the sync operation: write manifest, upload files, call API.
   * @param generation - The generation being synced
   */
  private async performSync(generation: number): Promise<void> {
    if (!this.manifest) {
      logger.error(`[Gen ${generation}] Cannot sync: no manifest`);

      return;
    }

    this.isSyncing = true;

    try {
      // Deep copy manifest to prevent mutations during async operations
      const manifestToSync: ApplicationManifest = JSON.parse(
        JSON.stringify(this.manifest),
      );

      logger.log(`[Gen ${generation}] Starting sync...`);

      // Step 1: Write manifest to disk
      await writeManifestToOutput(this.appPath, manifestToSync);

      // Step 2: Upload any queued files (from initial build when uploader wasn't ready)
      if (this.pendingUploads.size > 0 && this.fileUploader) {
        logger.log(
          `[Gen ${generation}] Uploading ${this.pendingUploads.size} queued file(s)...`,
        );

        const uploadPromises = Array.from(this.pendingUploads.values()).map(
          async (file) => {
            try {
              await this.fileUploader!.uploadFile({
                builtPath: file.builtPath,
                fileFolder: file.fileFolder,
              });
            } catch (error) {
              logger.error(
                `[Gen ${generation}] Upload failed for ${file.builtPath}: ${error instanceof Error ? error.message : error}`,
              );
            }
          },
        );

        await Promise.all(uploadPromises);
      }

      // Clear pending uploads after successful upload
      this.pendingUploads.clear();

      // Step 3: Wait for any active uploads that were started immediately in onFileBuilt()
      // Use a loop to catch uploads that may be added while we're waiting
      // (e.g., if the same file is changed multiple times rapidly)
      while (this.activeUploads.size > 0) {
        const uploadCount = this.activeUploads.size;
        logger.log(
          `[Gen ${generation}] Waiting for ${uploadCount} active upload(s) to complete...`,
        );
        await Promise.all(this.activeUploads);
      }

      // Step 4: Sync with API
      logger.log(`[Gen ${generation}] Syncing with server...`);
      const syncResult = await this.apiService.syncApplication(manifestToSync);

      if (syncResult.success) {
        logger.success(`[Gen ${generation}] ✓ Application synced successfully`);
      } else {
        logger.error(`[Gen ${generation}] ✗ Sync failed: ${syncResult.error}`);
      }
    } finally {
      this.isSyncing = false;
      logger.log('👀 Watching for changes...');
    }
  }
}
