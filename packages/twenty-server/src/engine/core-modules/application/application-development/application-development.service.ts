import { Injectable, Logger } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationInput } from 'src/engine/core-modules/application/application-development/dtos/application.input';
import { type DevelopmentApplicationDTO } from 'src/engine/core-modules/application/application-development/dtos/development-application.dto';
import { type WorkspaceMigrationDTO } from 'src/engine/core-modules/application/application-development/dtos/workspace-migration.dto';
import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { VERSION_REASON_TO_APPLICATION_EXCEPTION_CODE } from 'src/engine/core-modules/application/application-package/constants/version-reason-to-exception-code.constant';
import { ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { type FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const APP_DEV_RATE_LIMIT_MAX = 30;
const APP_DEV_RATE_LIMIT_WINDOW_MS = 30_000;

const APP_SYNC_LOCK_OPTIONS = { ttl: 60_000, ms: 500, maxRetries: 120 };

const ALLOWED_APPLICATION_FILE_FOLDERS: FileFolder[] = [
  FileFolder.BuiltLogicFunction,
  FileFolder.BuiltFrontComponent,
  FileFolder.PublicAsset,
  FileFolder.Source,
  FileFolder.Dependencies,
];

@Injectable()
export class ApplicationDevelopmentService {
  private readonly logger = new Logger(ApplicationDevelopmentService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationManifestApplyService: ApplicationManifestApplyService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationAssetService: ApplicationRegistrationAssetService,
    private readonly applicationVersionValidationService: ApplicationVersionValidationService,
    private readonly fileStorageService: FileStorageService,
    private readonly throttlerService: ThrottlerService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async createDevelopmentApplication({
    universalIdentifier,
    name,
    workspaceId,
  }: {
    universalIdentifier: string;
    name: string;
    workspaceId: string;
  }): Promise<DevelopmentApplicationDTO> {
    await this.throttlePerApplication(universalIdentifier, workspaceId);

    const applicationRegistrationId =
      await this.findApplicationRegistrationId(universalIdentifier);

    const existing = await this.applicationService.findByUniversalIdentifier({
      universalIdentifier,
      workspaceId,
    });

    if (existing) {
      return {
        id: existing.id,
        universalIdentifier: existing.universalIdentifier,
      };
    }

    const application = await this.applicationService.create({
      universalIdentifier,
      name,
      sourcePath: universalIdentifier,
      sourceType: ApplicationRegistrationSourceType.LOCAL,
      applicationRegistrationId,
      workspaceId,
    });

    return {
      id: application.id,
      universalIdentifier: application.universalIdentifier,
    };
  }

  async syncApplication({
    manifest,
    dryRun,
    workspaceId,
  }: {
    manifest: ApplicationInput['manifest'];
    dryRun?: boolean;
    workspaceId: string;
  }): Promise<WorkspaceMigrationDTO> {
    await this.throttlePerApplication(
      manifest.application.universalIdentifier,
      workspaceId,
    );

    const versionValidation =
      await this.applicationVersionValidationService.validateWorkspaceCompatibility(
        {
          requiredServerVersion:
            manifest.application.requiredServerVersionRange ?? undefined,
          workspaceId,
        },
      );

    if (!versionValidation.compatible) {
      throw new ApplicationException(
        versionValidation.message,
        VERSION_REASON_TO_APPLICATION_EXCEPTION_CODE[versionValidation.reason],
      );
    }

    if (dryRun === true) {
      const { workspaceMigration } =
        await this.applicationSyncService.synchronizeFromManifest({
          workspaceId,
          manifest,
          dryRun: true,
        });

      return {
        applicationUniversalIdentifier:
          workspaceMigration.applicationUniversalIdentifier,
        actions: workspaceMigration.actions,
      };
    }

    return this.cacheLockService.withLock(
      () => this.applyManifestSync(manifest, workspaceId),
      `app-sync:${workspaceId}`,
      APP_SYNC_LOCK_OPTIONS,
    );
  }

  async uploadApplicationFile({
    workspaceId,
    applicationUniversalIdentifier,
    fileFolder,
    filePath,
    getFileBuffer,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    fileFolder: FileFolder;
    filePath: string;
    // Lazy so rejected or rate-limited uploads are not buffered into memory.
    getFileBuffer: () => Promise<Buffer>;
  }): Promise<FileDTO> {
    await this.throttlePerApplication(
      applicationUniversalIdentifier,
      workspaceId,
    );

    if (!ALLOWED_APPLICATION_FILE_FOLDERS.includes(fileFolder)) {
      throw new ApplicationException(
        `Invalid fileFolder for application file upload. Allowed values: ${ALLOWED_APPLICATION_FILE_FOLDERS.join(', ')}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const pathValidationResult = validateFilePath({
      resourcePath: filePath,
      fileFolder,
    });

    if (!pathValidationResult.isValid) {
      throw new ApplicationException(
        pathValidationResult.error,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId,
      },
    );

    if (!isDefined(application)) {
      throw new ApplicationException(
        'Application not found in workspace.',
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return await this.fileStorageService.writeFile({
      sourceFile: await getFileBuffer(),
      fileFolder,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath: filePath,
      settings: { isTemporaryFile: false, toDelete: false },
    });
  }

  private async applyManifestSync(
    manifest: ApplicationInput['manifest'],
    workspaceId: string,
  ): Promise<WorkspaceMigrationDTO> {
    const applicationRegistrationId = await this.findApplicationRegistrationId(
      manifest.application.universalIdentifier,
    );

    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier: manifest.application.universalIdentifier,
        workspaceId,
      },
    );

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application "${manifest.application.universalIdentifier}" not found in workspace "${workspaceId}". Run createDevelopmentApplication first.`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const { workspaceMigration } =
      await this.applicationManifestApplyService.applyManifestToWorkspace({
        workspaceId,
        manifest,
        applicationRegistrationId,
        application,
      });

    await this.syncRegistrationMetadata(
      applicationRegistrationId,
      manifest,
      workspaceId,
    );

    return {
      applicationUniversalIdentifier:
        workspaceMigration.applicationUniversalIdentifier,
      actions: workspaceMigration.actions,
    };
  }

  private async throttlePerApplication(
    applicationIdentifier: string,
    workspaceId: string,
  ): Promise<void> {
    await this.throttlerService.tokenBucketThrottleOrThrow(
      `app-dev:${workspaceId}:${applicationIdentifier}`,
      1,
      APP_DEV_RATE_LIMIT_MAX,
      APP_DEV_RATE_LIMIT_WINDOW_MS,
    );
  }

  private async findApplicationRegistrationId(
    universalIdentifier: string,
  ): Promise<string> {
    const existingRegistration =
      await this.applicationRegistrationService.findOneByUniversalIdentifier(
        universalIdentifier,
      );

    if (!existingRegistration) {
      throw new ApplicationException(
        `No registration found for "${universalIdentifier}". Create one first with createApplicationRegistration.`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return existingRegistration.id;
  }

  private async syncRegistrationMetadata(
    applicationRegistrationId: string,
    manifest: ApplicationInput['manifest'],
    workspaceId: string,
  ): Promise<void> {
    const hasRefreshedRegistration =
      await this.applicationManifestApplyService.refreshRegistrationFromManifest(
        {
          applicationRegistrationId,
          manifest,
          sourceType: ApplicationRegistrationSourceType.LOCAL,
          onlyIfOwnedByWorkspaceId: workspaceId,
        },
      );

    if (!hasRefreshedRegistration) {
      return;
    }

    // Public assets are uploaded to workspace storage before the sync, so the
    // logo and gallery images can be copied into the registration's
    // instance-global server files here.
    await this.applicationRegistrationAssetService.storeRegistrationAssets({
      applicationRegistrationId,
      manifestApplication: manifest.application,
      readAsset: (path) =>
        this.readPublicAssetFromWorkspaceStorage({
          workspaceId,
          applicationUniversalIdentifier:
            manifest.application.universalIdentifier,
          path,
        }),
    });
  }

  private async readPublicAssetFromWorkspaceStorage({
    workspaceId,
    applicationUniversalIdentifier,
    path,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    path: string;
  }): Promise<Buffer | null> {
    try {
      const stream = await this.fileStorageService.readFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.PublicAsset,
        resourcePath: path,
      });

      return await streamToBuffer(stream);
    } catch (error) {
      // A missing or unreadable asset must not fail the whole dev sync; the
      // registration keeps its previously stored file for that path, if any.
      this.logger.warn(
        `Could not read public asset "${path}" for application ${applicationUniversalIdentifier}: ${error.message}`,
      );

      return null;
    }
  }
}
