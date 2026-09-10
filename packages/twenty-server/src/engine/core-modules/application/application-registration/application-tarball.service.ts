import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { isAbsolute, join, relative, resolve } from 'path';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

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
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import {
  type FileUploadStorageLocation,
  FileUploadCompletionService,
} from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { FileUploadTargetService } from 'src/engine/core-modules/file/file-upload/services/file-upload-target.service';
import { buildPendingUploadResourcePath } from 'src/engine/core-modules/file/file-upload/utils/build-pending-upload-resource-path.util';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import type { ApplicationManifest, Manifest } from 'twenty-shared/application';

const TARBALL_RESOURCE_FILENAME = 'app.tar.gz';
const TARBALL_UPLOAD_CONTENT_TYPE = 'application/octet-stream';
export type TarballPackageJson = {
  version?: string;
  engines?: { twenty?: string };
};

const TARBALL_FILE_SETTINGS = {
  isTemporaryFile: false,
  toDelete: false,
} as const;

@Injectable()
export class ApplicationTarballService {
  private readonly logger = new Logger(ApplicationTarballService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly applicationRegistrationAssetService: ApplicationRegistrationAssetService,
    private readonly applicationService: ApplicationService,
    private readonly applicationVersionValidationService: ApplicationVersionValidationService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly fileUploadTargetService: FileUploadTargetService,
    private readonly fileUploadCompletionService: FileUploadCompletionService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async createTarballUpload({
    workspaceId,
    manifest,
    packageJson,
    size,
  }: {
    workspaceId: string;
    manifest: Manifest;
    packageJson: TarballPackageJson;
    size: number;
  }): Promise<FileUploadTargetDTO> {
    const universalIdentifier = manifest.application?.universalIdentifier;

    if (!isDefined(universalIdentifier)) {
      throw new ApplicationRegistrationException(
        'universalIdentifier is required in the manifest',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    await this.assertServerCompatibility(packageJson?.engines?.twenty);

    const existingRegistration = await this.appRegistrationRepository.findOne({
      where: { universalIdentifier, ownerWorkspaceId: workspaceId },
    });

    const appRegistration = isDefined(existingRegistration)
      ? this.assertTarballCanReplaceRegistration({
          registration: existingRegistration,
          incomingVersion: packageJson?.version,
          universalIdentifier,
        })
      : await this.createTarballRegistration({
          universalIdentifier,
          manifest,
          packageJsonVersion: null,
          ownerWorkspaceId: workspaceId,
        });

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const fileId = v4();
    const resourcePath = `${appRegistration.id}/${fileId}/${TARBALL_RESOURCE_FILENAME}`;

    await this.fileStorageService.createPendingFile({
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      workspaceId,
      resourcePath,
      fileId,
      size,
      mimeType: TARBALL_UPLOAD_CONTENT_TYPE,
      settings: TARBALL_FILE_SETTINGS,
    });

    return this.fileUploadTargetService.buildUploadTarget({
      workspaceId,
      fileId,
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      resourcePath,
      contentType: TARBALL_UPLOAD_CONTENT_TYPE,
      size,
    });
  }

  async completeTarballUpload({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const file = await this.fileRepository.findOne(workspaceId, {
      where: { id: fileId },
    });

    if (
      !isDefined(file) ||
      !file.path.startsWith(`${FileFolder.AppTarball}/`)
    ) {
      throw new ApplicationRegistrationException(
        `Tarball upload not found: ${fileId}`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const storageLocation = {
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      workspaceId,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    };

    const tarballBuffer = await streamToBuffer(
      await this.fileStorageService.readFile({
        ...storageLocation,
        resourcePath: buildPendingUploadResourcePath({
          fileId,
          resourcePath: storageLocation.resourcePath,
        }),
      }),
      Number(file.size),
    );

    return this.registerTarball({
      tarballBuffer,
      ownerWorkspaceId: workspaceId,
      uploadedTarball: { file, storageLocation },
    });
  }

  async registerTarball(params: {
    tarballBuffer: Buffer;
    universalIdentifier?: string;
    ownerWorkspaceId: string;
    uploadedTarball?: {
      file: FileEntity;
      storageLocation: FileUploadStorageLocation;
    };
  }): Promise<ApplicationRegistrationEntity> {
    const tempDir = join(tmpdir(), 'twenty-tarball-upload', v4());

    await fs.mkdir(tempDir, { recursive: true });

    try {
      const { contentDir, manifest, packageJson } =
        await this.extractAndValidateTarball(tempDir, params.tarballBuffer);

      const universalIdentifier =
        params.universalIdentifier ?? manifest.application?.universalIdentifier;

      if (!isDefined(universalIdentifier)) {
        throw new ApplicationRegistrationException(
          'universalIdentifier is required (in body or manifest)',
          ApplicationRegistrationExceptionCode.INVALID_INPUT,
        );
      }

      const existingRegistration = await this.appRegistrationRepository.findOne(
        {
          where: {
            universalIdentifier,
            ownerWorkspaceId: params.ownerWorkspaceId,
          },
        },
      );

      const isNewRegistration = !isDefined(existingRegistration);
      const previousLatestAvailableVersion =
        existingRegistration?.latestAvailableVersion ?? null;

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
            ownerWorkspaceId: params.ownerWorkspaceId,
          });

      const previousTarballFileId = appRegistration.tarballFileId;

      const tarballFileId = isDefined(params.uploadedTarball)
        ? (
            await this.fileUploadCompletionService.completeUploadedFileWithinDeadline(
              {
                workspaceId: params.ownerWorkspaceId,
                ...params.uploadedTarball,
              },
            )
          ).id
        : (
            await this.storeTarballFile({
              appRegistration,
              tarballBuffer: params.tarballBuffer,
              ownerWorkspaceId: params.ownerWorkspaceId,
            })
          ).id;

      await this.applicationRegistrationService.updateFromManifest({
        applicationRegistrationId: appRegistration.id,
        manifest: manifest as Manifest,
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        latestAvailableVersion: packageJson?.version ?? null,
        additionalFields: {
          tarballFileId,
          isListed: false,
          isVetted: false,
          ownerWorkspaceId: params.ownerWorkspaceId,
        },
      });

      if (
        isDefined(previousTarballFileId) &&
        previousTarballFileId !== tarballFileId
      ) {
        await this.deleteSupersededTarballFile({
          workspaceId: params.ownerWorkspaceId,
          fileId: previousTarballFileId,
        });
      }

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

      return this.appRegistrationRepository.findOneOrFail({
        where: { id: appRegistration.id },
      });
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async extractAndValidateTarball(
    tempDir: string,
    tarballBuffer: Buffer,
  ): Promise<{
    contentDir: string;
    manifest: { application?: ApplicationManifest };
    packageJson: { version: string; engines?: { twenty?: string } } | null;
  }> {
    const tarballPath = join(tempDir, 'app.tar.gz');

    await fs.writeFile(tarballPath, tarballBuffer);

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

    await this.assertServerCompatibility(packageJson?.engines?.twenty);

    return { contentDir, manifest, packageJson };
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

  private async storeTarballFile({
    appRegistration,
    tarballBuffer,
    ownerWorkspaceId,
  }: {
    appRegistration: ApplicationRegistrationEntity;
    tarballBuffer: Buffer;
    ownerWorkspaceId: string;
  }) {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId: ownerWorkspaceId },
      );

    const fileId = appRegistration.tarballFileId ?? v4();

    return this.fileStorageService.writeFile({
      sourceFile: tarballBuffer,
      resourcePath: `${appRegistration.id}/${fileId}/${TARBALL_RESOURCE_FILENAME}`,
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      workspaceId: ownerWorkspaceId,
      fileId,
      settings: TARBALL_FILE_SETTINGS,
    });
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

  private async assertServerCompatibility(
    engineRange: string | undefined,
  ): Promise<void> {
    const versionValidation =
      await this.applicationVersionValidationService.validateServerCompatibility(
        engineRange,
      );

    if (!versionValidation.compatible) {
      throw new ApplicationRegistrationException(
        versionValidation.message,
        VERSION_REASON_TO_APPLICATION_REGISTRATION_EXCEPTION_CODE[
          versionValidation.reason
        ],
      );
    }
  }

  private async deleteSupersededTarballFile({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<void> {
    try {
      await this.fileStorageService.deleteByFileId({
        fileId,
        workspaceId,
        fileFolder: FileFolder.AppTarball,
      });
    } catch (error) {
      this.logger.warn(
        `Could not delete superseded tarball file ${fileId}: ${error}`,
      );
    }
  }
}
