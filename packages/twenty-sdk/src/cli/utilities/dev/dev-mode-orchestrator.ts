import {
  type ManifestBuildResult,
  manifestUpdateChecksums,
} from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { ApiService } from '@/cli/utilities/api/api-service';
import { ClientService } from '@/cli/utilities/client/client-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { type Manifest } from 'twenty-shared/application';
import { type FileFolder } from 'twenty-shared/types';
import type { Location } from 'esbuild';
import { type DevUiStateManager } from '@/cli/utilities/dev/dev-ui-state-manager';
import { type EventName } from 'chokidar/handler.js';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';

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
  private clientService = new ClientService();
  private configService = new ConfigService();

  private activeUploads = new Set<Promise<void>>();

  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private uiStateManager: DevUiStateManager;
  private serverReady = false;
  private serverErrorLogged = false;
  private previousObjectsFieldsFingerprint: string | null = null;

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
    const validateAuth = await this.apiService.validateAuth();

    if (!validateAuth.serverUp) {
      if (!this.serverErrorLogged) {
        this.uiStateManager.addEvent({
          message: 'Cannot reach server',
          status: 'error',
        });
        this.uiStateManager.updateSyncState({
          syncStatus: 'error',
          error: 'Cannot connect to Twenty server. Is it running?',
        });
        this.serverErrorLogged = true;
      }
      return;
    }
    if (!validateAuth.authValid) {
      if (!this.serverErrorLogged) {
        this.uiStateManager.addEvent({
          message: 'Authentication failed',
          status: 'error',
        });
        this.uiStateManager.updateSyncState({
          syncStatus: 'error',
          error:
            'Cannot authenticate. Check your credentials are correct with "yarn auth:login"',
        });
        this.serverErrorLogged = true;
      }
      return;
    }
    this.serverErrorLogged = false;
    this.serverReady = true;
  }

  async handleChangeDetected(sourcePath: string, event: EventName) {
    if (!this.serverReady) {
      await this.checkServer();
    }

    if (!this.serverReady) {
      return;
    }

    this.uiStateManager.addEvent({
      message: `Change detected: ${sourcePath}`,
      status: 'info',
    });

    if (event === 'unlink') {
      this.uiStateManager.removeEntity(sourcePath);
    } else {
      this.uiStateManager.updateFileStatus(sourcePath, 'building');
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

  private async resolveApplicationId(
    result: ManifestBuildResult,
  ): Promise<string | null> {
    const universalIdentifier =
      result.manifest!.application.universalIdentifier;

    const findApplicationResult =
      await this.apiService.findOneApplication(universalIdentifier);

    if (!findApplicationResult.success) {
      this.uiStateManager.addEvent({
        message: `Failed to find application ${universalIdentifier}`,
        status: 'error',
      });
      this.uiStateManager.updateSyncState({
        syncStatus: 'error',
        error: 'Failed to find application',
      });
      return null;
    }

    if (findApplicationResult.data) {
      return findApplicationResult.data.id;
    }

    this.uiStateManager.addEvent({
      message: 'Creating application',
      status: 'info',
    });

    const createApplicationResult = await this.apiService.createApplication(
      result.manifest!,
    );

    if (!createApplicationResult.success) {
      this.uiStateManager.addEvent({
        message: `Application creation failed with error ${JSON.stringify(createApplicationResult.error, null, 2)}`,
        status: 'error',
      });
      this.uiStateManager.updateSyncState({
        syncStatus: 'error',
        error: `Application creation failed with error ${JSON.stringify(createApplicationResult.error, null, 2)}`,
      });
      return null;
    }

    this.uiStateManager.addEvent({
      message: 'Application created',
      status: 'success',
    });

    return createApplicationResult.data!.id;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      );

      // Consider expired 60s before actual expiry to avoid race conditions
      return Date.now() >= payload.exp * 1000 - 60_000;
    } catch {
      return true;
    }
  }

  private async ensureValidTokens(): Promise<void> {
    const config = await this.configService.getConfig();

    if (!config.applicationAccessToken || !config.applicationRefreshToken) {
      return;
    }

    if (!this.isTokenExpired(config.applicationAccessToken)) {
      return;
    }

    if (this.isTokenExpired(config.applicationRefreshToken)) {
      this.uiStateManager.addEvent({
        message:
          'Application refresh token expired, re-run app:dev to re-authenticate',
        status: 'error',
      });
      return;
    }

    this.uiStateManager.addEvent({
      message: 'Renewing application tokens',
      status: 'info',
    });

    const renewResult = await this.apiService.renewApplicationToken(
      config.applicationRefreshToken,
    );

    if (!renewResult.success) {
      this.uiStateManager.addEvent({
        message: `Failed to renew application tokens: ${JSON.stringify(renewResult.error, null, 2)}`,
        status: 'error',
      });
      return;
    }

    await this.configService.setConfig({
      applicationAccessToken: renewResult.data.applicationAccessToken.token,
      applicationRefreshToken: renewResult.data.applicationRefreshToken.token,
    });

    this.uiStateManager.addEvent({
      message: 'Application tokens renewed',
      status: 'success',
    });
  }

  private async exchangeTokens(applicationId: string): Promise<void> {
    this.uiStateManager.addEvent({
      message: 'Generating application tokens',
      status: 'info',
    });

    const tokenResult =
      await this.apiService.generateApplicationToken(applicationId);

    if (!tokenResult.success) {
      this.uiStateManager.addEvent({
        message: `Failed to generate application tokens: ${JSON.stringify(tokenResult.error, null, 2)}`,
        status: 'error',
      });
      return;
    }

    await this.configService.setConfig({
      applicationAccessToken: tokenResult.data.applicationAccessToken.token,
      applicationRefreshToken: tokenResult.data.applicationRefreshToken.token,
    });

    this.uiStateManager.addEvent({
      message: 'Application tokens stored in config',
      status: 'success',
    });
  }

  private computeObjectsFieldsFingerprint(manifest: Manifest): string {
    return JSON.stringify({
      objects: manifest.objects,
      fields: manifest.fields,
    });
  }

  private hasObjectsOrFieldsChanged(manifest: Manifest): boolean {
    const fingerprint = this.computeObjectsFieldsFingerprint(manifest);
    const changed = fingerprint !== this.previousObjectsFieldsFingerprint;

    this.previousObjectsFieldsFingerprint = fingerprint;

    return changed;
  }

  private async generateApiClient(): Promise<void> {
    const config = await this.configService.getConfig();

    this.uiStateManager.updateStepStatus({
      step: 'apiClientStatus',
      status: 'in_progress',
    });

    try {
      await this.clientService.generate({
        appPath: this.appPath,
        authToken: config.applicationAccessToken,
      });

      this.uiStateManager.updateStepStatus({
        step: 'apiClientStatus',
        status: 'done',
      });
    } catch (error) {
      this.uiStateManager.updateStepStatus({
        step: 'apiClientStatus',
        status: 'error',
      });
      this.uiStateManager.addEvent({
        message: `Failed to generate API client: ${error instanceof Error ? error.message : String(error)}`,
        status: 'error',
      });
    }
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
      await this.ensureValidTokens();

      this.uiStateManager.addEvent({
        message: 'Building manifest',
        status: 'info',
      });
      this.uiStateManager.updateSyncState({
        syncStatus: 'building',
      });
      this.uiStateManager.updateStepStatus({
        step: 'manifestStatus',
        status: 'in_progress',
      });

      const result = await buildManifest(this.appPath);

      if (result.errors.length > 0 || !result.manifest) {
        for (const error of result.errors) {
          this.uiStateManager.addEvent({
            message: error,
            status: 'error',
          });
        }
        this.uiStateManager.updateSyncState({
          syncStatus: 'error',
          error: result.errors[result.errors.length - 1],
        });
        this.uiStateManager.updateStepStatus({
          step: 'manifestStatus',
          status: 'error',
        });
        return;
      }

      const validation = manifestValidate(result.manifest);

      if (!validation.isValid) {
        for (const e of validation.errors) {
          this.uiStateManager.addEvent({
            message: e,
            status: 'error',
          });
          this.uiStateManager.updateSyncState({
            syncStatus: 'error',
            error: e,
          });
        }
        this.uiStateManager.updateStepStatus({
          step: 'manifestStatus',
          status: 'error',
        });
        return;
      }

      this.uiStateManager.updateSyncState({
        appName: result.manifest.application.displayName,
      });

      this.uiStateManager.updateAllFilesTypes({
        manifestFilePaths: result.filePaths,
      });

      if (validation.warnings.length > 0) {
        for (const warning of validation.warnings) {
          this.uiStateManager.addEvent({
            message: `⚠ ${warning}`,
            status: 'warning',
          });
        }
      }

      this.uiStateManager.addEvent({
        message: 'Successfully built manifest',
        status: 'success',
      });
      this.uiStateManager.updateStepStatus({
        step: 'manifestStatus',
        status: 'done',
      });

      await this.handleManifestBuilt(result);

      if (!this.fileUploader) {
        const applicationId = await this.resolveApplicationId(result);

        if (!applicationId) {
          return;
        }

        await this.exchangeTokens(applicationId);

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

      if (this.hasObjectsOrFieldsChanged(result.manifest)) {
        await this.generateApiClient();
      }

      while (this.activeUploads.size > 0) {
        await Promise.all(this.activeUploads);
      }

      const manifest = manifestUpdateChecksums({
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

      this.uiStateManager.updateSyncState({
        syncStatus: 'syncing',
      });

      const syncResult = await this.apiService.syncApplication(manifest);

      this.uiStateManager.updateAllFilesStatus('success');

      if (syncResult.success) {
        this.uiStateManager.addEvent({
          message: '✓ Synced',
          status: 'success',
        });
        this.uiStateManager.updateSyncState({
          syncStatus: 'synced',
        });
      } else {
        this.uiStateManager.addEvent({
          message: `Sync failed with error ${JSON.stringify(syncResult.error, null, 2)}`,
          status: 'error',
        });
        this.uiStateManager.updateSyncState({
          syncStatus: 'error',
        });
      }
    } catch (error) {
      this.uiStateManager.addEvent({
        message: `Sync failed with error ${JSON.stringify(error, null, 2)}`,
        status: 'error',
      });
      this.uiStateManager.updateSyncState({
        syncStatus: 'error',
      });
    } finally {
      this.isSyncing = false;
    }
  }
}
