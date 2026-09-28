import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createWriteStream, promises as fs } from 'fs';
import { tmpdir } from 'os';
import { isAbsolute, join, relative, resolve } from 'path';
import { pipeline } from 'stream/promises';

import { FileFolder } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { Like, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import {
  VERSION_PROGRESSION_REASON_TO_DEPLOY_EXCEPTION_CODE,
  VERSION_REASON_TO_APPLICATION_REGISTRATION_EXCEPTION_CODE,
} from 'src/engine/core-modules/application/application-package/constants/version-reason-to-exception-code.constant';
import { extractTarballSecurely } from 'src/engine/core-modules/application/application-package/utils/extract-tarball-securely.util';
import { readJsonFile } from 'src/engine/core-modules/application/application-package/utils/read-json-file.util';
import { resolvePackageContentDir } from 'src/engine/core-modules/application/application-package/utils/tarball-utils';
import { ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { fromManifestApplicationToDisplayFields } from 'src/engine/core-modules/application/application-registration/utils/from-manifest-application-to-display-fields.util';
import { getTarballUploadCompletionLockName } from 'src/engine/core-modules/application/application-registration/utils/get-tarball-upload-completion-lock-name.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  FileUploadCompletionService,
  type FileUploadStorageLocation,
} from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import type { ApplicationManifest, Manifest } from 'twenty-shared/application';

const TARBALL_FILE_NAME = 'app.tar.gz';

type ExtractedTarball = {
  contentDir: string;
  manifest: { application: ApplicationManifest };
  packageJson: { version: string; engines?: { twenty?: string } } | null;
};

@Injectable()
export class ApplicationTarballService {
  private readonly logger = new Logger(ApplicationTarballService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly fileUploadCompletionService: FileUploadCompletionService,
    private readonly applicationRegistrationAssetService: ApplicationRegistrationAssetService,
    private readonly applicationService: ApplicationService,
    private readonly applicationVersionValidationService: ApplicationVersionValidationService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
  ) {}

  async uploadTarball(params: {
    tarballBuffer: Buffer;
    ownerWorkspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    return this.withTempDir(async (tempDir) => {
      const tarballPath = join(tempDir, TARBALL_FILE_NAME);

      await fs.writeFile(tarballPath, params.tarballBuffer);

      const extractedTarball = await this.extractAndValidateTarball(
        tempDir,
        tarballPath,
      );

      return this.registerExtractedTarball({
        extractedTarball,
        ownerWorkspaceId: params.ownerWorkspaceId,
        storeTarballFile: (appRegistration) =>
          this.storeTarballFile({
            appRegistration,
            tarballBuffer: params.tarballBuffer,
            ownerWorkspaceId: params.ownerWorkspaceId,
          }),
      });
    });
  }

  async completeTarballUpload({
    ownerWorkspaceId,
    fileId,
  }: {
    ownerWorkspaceId: string;
    fileId: string;
  }): Promise<ApplicationRegistrationEntity> {
    // Completions of one upload run one at a time: an overlapping request
    // would race the registration insert, so it is refused and a later retry
    // finds the registration the first one attached.
    const lockResult = await this.postgresAdvisoryLockService.tryWithLock(
      getTarballUploadCompletionLockName(fileId),
      () => this.completeTarballUploadExclusively({ ownerWorkspaceId, fileId }),
    );

    if (!lockResult.acquired) {
      throw new ApplicationRegistrationException(
        `Tarball upload ${fileId} is already being completed`,
        ApplicationRegistrationExceptionCode.TARBALL_UPLOAD_COMPLETION_IN_PROGRESS,
      );
    }

    return lockResult.value;
  }

  private async completeTarballUploadExclusively({
    ownerWorkspaceId,
    fileId,
  }: {
    ownerWorkspaceId: string;
    fileId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const file = await this.fileRepository.findOne(ownerWorkspaceId, {
      where: { id: fileId, path: Like(`${FileFolder.AppTarball}/%`) },
    });

    if (!isDefined(file)) {
      throw new ApplicationRegistrationException(
        `Tarball upload ${fileId} not found`,
        ApplicationRegistrationExceptionCode.TARBALL_UPLOAD_NOT_FOUND,
      );
    }

    const attachedRegistration = await this.findRegistrationAttachedToFile({
      fileId: file.id,
      ownerWorkspaceId,
    });

    const applicationUniversalIdentifier =
      await this.findOwnerCustomApplicationUniversalIdentifier(
        ownerWorkspaceId,
      );

    const storageLocation: FileUploadStorageLocation = {
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier,
      workspaceId: ownerWorkspaceId,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    };

    if (file.status !== FILE_STATUS.UPLOADED) {
      await this.fileUploadCompletionService.completeUploadedFile({
        workspaceId: ownerWorkspaceId,
        file,
        storageLocation,
      });
    }

    try {
      const registration = await this.withTempDir(async (tempDir) => {
        const tarballPath = join(tempDir, TARBALL_FILE_NAME);

        await pipeline(
          await this.fileStorageService.readFile(storageLocation),
          createWriteStream(tarballPath),
        );

        const extractedTarball = await this.extractAndValidateTarball(
          tempDir,
          tarballPath,
        );

        if (isDefined(attachedRegistration)) {
          return this.resumeAttachedRegistration({
            appRegistration: attachedRegistration,
            extractedTarball,
          });
        }

        return this.registerExtractedTarball({
          extractedTarball,
          ownerWorkspaceId,
          storeTarballFile: async () => file,
        });
      });

      await this.fileRepository.update(
        ownerWorkspaceId,
        { id: file.id },
        { settings: { isTemporaryFile: false, toDelete: false } },
      );

      return registration;
    } catch (error) {
      await this.deleteTarballFileUnlessAttached({
        fileId: file.id,
        ownerWorkspaceId,
      });

      throw error;
    }
  }

  // The registration is attached to its tarball before the assets are stored
  // and the auto-upgrade is enqueued, so a retried completion cannot tell
  // where the previous attempt stopped and reruns those idempotent steps.
  private async resumeAttachedRegistration({
    appRegistration,
    extractedTarball: { contentDir, manifest },
  }: {
    appRegistration: ApplicationRegistrationEntity;
    extractedTarball: ExtractedTarball;
  }): Promise<ApplicationRegistrationEntity> {
    await this.applicationRegistrationAssetService.storeRegistrationAssets({
      applicationRegistrationId: appRegistration.id,
      manifestApplication: manifest.application,
      readAsset: (path) => this.readAssetFromContentDir(contentDir, path),
    });

    await this.applicationRegistrationService.enqueueAutoUpgradeApplications(
      appRegistration.id,
    );

    return this.appRegistrationRepository.findOneOrFail({
      where: { id: appRegistration.id },
    });
  }

  private async findRegistrationAttachedToFile({
    fileId,
    ownerWorkspaceId,
  }: {
    fileId: string;
    ownerWorkspaceId: string;
  }): Promise<ApplicationRegistrationEntity | null> {
    return this.appRegistrationRepository.findOne({
      where: { tarballFileId: fileId, ownerWorkspaceId },
    });
  }

  private async registerExtractedTarball({
    extractedTarball: { contentDir, manifest, packageJson },
    ownerWorkspaceId,
    storeTarballFile,
  }: {
    extractedTarball: ExtractedTarball;
    ownerWorkspaceId: string;
    storeTarballFile: (
      appRegistration: ApplicationRegistrationEntity,
    ) => Promise<Pick<FileEntity, 'id'>>;
  }): Promise<ApplicationRegistrationEntity> {
    const universalIdentifier = manifest.application.universalIdentifier;

    const existingRegistration = await this.appRegistrationRepository.findOne({
      where: {
        universalIdentifier,
        ownerWorkspaceId,
      },
    });

    const isNewRegistration = !isDefined(existingRegistration);
    const previousLatestAvailableVersion =
      existingRegistration?.latestAvailableVersion ?? null;
    const previousTarballFileId = existingRegistration?.tarballFileId ?? null;

    const appRegistration = isDefined(existingRegistration)
      ? this.assertTarballCanReplaceRegistration({
          registration: existingRegistration,
          incomingVersion: packageJson?.version,
          universalIdentifier,
        })
      : await this.createTarballRegistration({
          universalIdentifier,
          manifest,
          packageJsonVersion: packageJson?.version ?? null,
          ownerWorkspaceId,
        });

    const savedFile = await storeTarballFile(appRegistration);

    await this.applicationRegistrationService.updateFromManifest({
      applicationRegistrationId: appRegistration.id,
      manifest: manifest as Manifest,
      sourceType: ApplicationRegistrationSourceType.TARBALL,
      latestAvailableVersion: packageJson?.version ?? null,
      additionalFields: {
        tarballFileId: savedFile.id,
        isListed: false,
        isVetted: false,
        ownerWorkspaceId,
      },
    });

    await this.applicationRegistrationAssetService.storeRegistrationAssets({
      applicationRegistrationId: appRegistration.id,
      manifestApplication: manifest.application,
      readAsset: (path) => this.readAssetFromContentDir(contentDir, path),
    });

    this.logger.log(
      `Tarball uploaded for app ${universalIdentifier} (registration ${appRegistration.id})`,
    );

    const incomingVersion = packageJson?.version ?? null;

    if (
      isNewRegistration ||
      previousLatestAvailableVersion !== incomingVersion
    ) {
      this.applicationRegistrationService.emitRegistrationPublishMetric({
        isNewRegistration,
        universalIdentifier,
        name: manifest.application?.displayName ?? 'Unknown App',
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        version: incomingVersion,
      });

      if (!isNewRegistration) {
        await this.applicationRegistrationService.enqueueAutoUpgradeApplications(
          appRegistration.id,
        );
      }
    }

    if (
      isDefined(previousTarballFileId) &&
      previousTarballFileId !== savedFile.id
    ) {
      await this.deleteTarballFileSilently({
        fileId: previousTarballFileId,
        ownerWorkspaceId,
      });
    }

    return this.appRegistrationRepository.findOneOrFail({
      where: { id: appRegistration.id },
    });
  }

  private async withTempDir<TResult>(
    run: (tempDir: string) => Promise<TResult>,
  ): Promise<TResult> {
    const tempDir = join(tmpdir(), 'twenty-tarball-upload', v4());

    await fs.mkdir(tempDir, { recursive: true });

    try {
      return await run(tempDir);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async extractAndValidateTarball(
    tempDir: string,
    tarballPath: string,
  ): Promise<ExtractedTarball> {
    const extractDir = join(tempDir, 'extracted');

    await fs.mkdir(extractDir, { recursive: true });
    await extractTarballSecurely(tarballPath, extractDir);

    const contentDir = await resolvePackageContentDir(extractDir);

    const manifest = await readJsonFile<{
      application?: ApplicationManifest;
    }>(contentDir, 'manifest.json');

    const packageJson = await readJsonFile<{
      version: string;
      engines?: { twenty?: string };
    }>(contentDir, 'package.json');

    if (manifest === null) {
      throw new ApplicationRegistrationException(
        'manifest.json not found or invalid in tarball',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    if (
      !isDefined(manifest.application) ||
      !isValidUuid(manifest.application.universalIdentifier)
    ) {
      throw new ApplicationRegistrationException(
        'Tarball manifest application universalIdentifier must be a valid UUID',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const versionValidation =
      await this.applicationVersionValidationService.validateServerCompatibility(
        packageJson?.engines?.twenty,
      );

    if (!versionValidation.compatible) {
      throw new ApplicationRegistrationException(
        versionValidation.message,
        VERSION_REASON_TO_APPLICATION_REGISTRATION_EXCEPTION_CODE[
          versionValidation.reason
        ],
      );
    }

    return {
      contentDir,
      manifest: { application: manifest.application },
      packageJson,
    };
  }

  private assertTarballCanReplaceRegistration({
    registration,
    incomingVersion,
    universalIdentifier,
  }: {
    registration: ApplicationRegistrationEntity;
    incomingVersion: string | undefined;
    universalIdentifier: string;
  }): ApplicationRegistrationEntity {
    if (
      registration.sourceType !== ApplicationRegistrationSourceType.LOCAL &&
      registration.sourceType !== ApplicationRegistrationSourceType.TARBALL
    ) {
      throw new ApplicationRegistrationException(
        `This app is registered as ${registration.sourceType}. Cannot upload tarball.`,
        ApplicationRegistrationExceptionCode.SOURCE_CHANNEL_MISMATCH,
      );
    }

    if (
      registration.sourceType === ApplicationRegistrationSourceType.TARBALL &&
      isDefined(registration.latestAvailableVersion) &&
      isDefined(incomingVersion)
    ) {
      const progression =
        this.applicationVersionValidationService.validateVersionProgression({
          incomingVersion,
          currentVersion: registration.latestAvailableVersion,
          universalIdentifier,
          action: 'deploy',
        });

      if (!progression.allowed) {
        throw new ApplicationRegistrationException(
          progression.message,
          VERSION_PROGRESSION_REASON_TO_DEPLOY_EXCEPTION_CODE[
            progression.reason
          ],
        );
      }
    }

    return registration;
  }

  private async createTarballRegistration({
    universalIdentifier,
    manifest,
    packageJsonVersion,
    ownerWorkspaceId,
  }: {
    universalIdentifier: string;
    manifest: { application?: ApplicationManifest };
    packageJsonVersion: string | null;
    ownerWorkspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    return this.appRegistrationRepository.save(
      this.appRegistrationRepository.create({
        universalIdentifier,
        name: manifest.application?.displayName ?? 'Unknown App',
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        manifest,
        ...fromManifestApplicationToDisplayFields(manifest.application),
        latestAvailableVersion: packageJsonVersion,
        isListed: false,
        isVetted: false,
        oAuthClientId: v4(),
        oAuthRedirectUris: [],
        oAuthScopes: [],
        ownerWorkspaceId,
      }),
    );
  }

  private async findOwnerCustomApplicationUniversalIdentifier(
    ownerWorkspaceId: string,
  ): Promise<string> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId: ownerWorkspaceId },
      );

    return workspaceCustomFlatApplication.universalIdentifier;
  }

  private async storeTarballFile({
    appRegistration,
    tarballBuffer,
    ownerWorkspaceId,
  }: {
    appRegistration: ApplicationRegistrationEntity;
    tarballBuffer: Buffer;
    ownerWorkspaceId: string;
  }): Promise<FileEntity> {
    const applicationUniversalIdentifier =
      await this.findOwnerCustomApplicationUniversalIdentifier(
        ownerWorkspaceId,
      );

    return this.fileStorageService.writeFile({
      sourceFile: tarballBuffer,
      resourcePath: `${appRegistration.id}/${TARBALL_FILE_NAME}`,
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier,
      workspaceId: ownerWorkspaceId,
      fileId: appRegistration.tarballFileId ?? v4(),
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });
  }

  private async deleteTarballFileUnlessAttached({
    fileId,
    ownerWorkspaceId,
  }: {
    fileId: string;
    ownerWorkspaceId: string;
  }): Promise<void> {
    const attachedRegistration = await this.findRegistrationAttachedToFile({
      fileId,
      ownerWorkspaceId,
    });

    if (isDefined(attachedRegistration)) {
      return;
    }

    await this.deleteTarballFileSilently({ fileId, ownerWorkspaceId });
  }

  private async deleteTarballFileSilently({
    fileId,
    ownerWorkspaceId,
  }: {
    fileId: string;
    ownerWorkspaceId: string;
  }): Promise<void> {
    try {
      await this.fileStorageService.deleteByFileId({
        fileId,
        workspaceId: ownerWorkspaceId,
        fileFolder: FileFolder.AppTarball,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to delete tarball file ${fileId} of workspace ${ownerWorkspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async readAssetFromContentDir(
    contentDir: string,
    path: string,
  ): Promise<Buffer | null> {
    const absolutePath = resolve(contentDir, path);
    const relativeToContentDir = relative(contentDir, absolutePath);

    if (
      relativeToContentDir === '..' ||
      relativeToContentDir.startsWith('../') ||
      isAbsolute(relativeToContentDir)
    ) {
      this.logger.warn(
        `Asset "${path}" escapes the package directory; skipping`,
      );

      return null;
    }

    return fs.readFile(absolutePath);
  }
}
