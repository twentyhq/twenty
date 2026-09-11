import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { basename, extname, isAbsolute, join, relative, resolve } from 'path';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Like, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { VERSION_PROGRESSION_REASON_TO_DEPLOY_EXCEPTION_CODE } from 'src/engine/core-modules/application/application-package/constants/version-reason-to-exception-code.constant';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { extractTarballSecurely } from 'src/engine/core-modules/application/application-package/utils/extract-tarball-securely.util';
import { readJsonFile } from 'src/engine/core-modules/application/application-package/utils/read-json-file.util';
import { resolvePackageContentDir } from 'src/engine/core-modules/application/application-package/utils/tarball-utils';
import { ApplicationCatalogRegistrationService } from 'src/engine/core-modules/application/application-registration/application-catalog-registration.service';
import { type ReadRegistrationAsset } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { PrivateApplicationDeploymentDTO } from 'src/engine/core-modules/application/application-registration/dtos/private-application-deployment.dto';
import { type PrivateApplicationDeploymentLogoInput } from 'src/engine/core-modules/application/application-registration/dtos/create-private-application-deployment.input';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type TarballPackageJson } from 'src/engine/core-modules/application/application-registration/types/tarball-package-json.type';
import { isImageFilePath } from 'src/engine/core-modules/application/application-registration/utils/is-image-file-path.util';
import { isStorableAssetPath } from 'src/engine/core-modules/application/application-registration/utils/is-storable-asset-path.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import {
  type FileUploadStorageLocation,
  FileUploadCompletionService,
} from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { FileUploadTargetService } from 'src/engine/core-modules/file/file-upload/services/file-upload-target.service';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import type { ApplicationManifest, Manifest } from 'twenty-shared/application';

const TARBALL_RESOURCE_FILENAME = 'app.tar.gz';
const DEPLOYMENT_UPLOAD_CONTENT_TYPE = 'application/octet-stream';
const TARBALL_FILE_SETTINGS = {
  isTemporaryFile: false,
  toDelete: false,
} as const;

type UploadedLogo = { filename: string; contents: Buffer };

@Injectable()
export class ApplicationTarballService {
  private readonly logger = new Logger(ApplicationTarballService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly applicationCatalogRegistrationService: ApplicationCatalogRegistrationService,
    private readonly applicationService: ApplicationService,
    private readonly applicationVersionValidationService: ApplicationVersionValidationService,
    private readonly fileUploadTargetService: FileUploadTargetService,
    private readonly fileUploadCompletionService: FileUploadCompletionService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async createPrivateApplicationDeployment({
    workspaceId,
    universalIdentifier,
    version,
    tarballSize,
    logo,
  }: {
    workspaceId: string;
    universalIdentifier: string;
    version: string;
    tarballSize: number;
    logo?: PrivateApplicationDeploymentLogoInput;
  }): Promise<PrivateApplicationDeploymentDTO> {
    const existingRegistration = await this.appRegistrationRepository.findOne({
      where: { universalIdentifier },
    });

    if (isDefined(existingRegistration)) {
      this.assertRegistrationCanBeDeployedBy({
        registration: existingRegistration,
        workspaceId,
        incomingVersion: version,
      });
    }

    if (isDefined(logo) && !isImageFilePath(logo.filename)) {
      throw new ApplicationRegistrationException(
        `Logo "${logo.filename}" is not a supported image file`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const deploymentId = v4();
    const applicationUniversalIdentifier =
      await this.resolveWorkspaceApplicationUniversalIdentifier(workspaceId);

    const tarball = await this.createDeploymentUpload({
      workspaceId,
      applicationUniversalIdentifier,
      resourcePath: `${universalIdentifier}/${deploymentId}/${TARBALL_RESOURCE_FILENAME}`,
      size: tarballSize,
    });

    return {
      deploymentId,
      tarball,
      logo: isDefined(logo)
        ? await this.createDeploymentUpload({
            workspaceId,
            applicationUniversalIdentifier,
            resourcePath: `${universalIdentifier}/${deploymentId}/logo${extname(logo.filename).toLowerCase()}`,
            size: logo.size,
          })
        : null,
    };
  }

  async completePrivateApplicationDeployment({
    workspaceId,
    deploymentId,
  }: {
    workspaceId: string;
    deploymentId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const applicationUniversalIdentifier =
      await this.resolveWorkspaceApplicationUniversalIdentifier(workspaceId);

    const deploymentFiles = await this.fileRepository.find(workspaceId, {
      where: {
        path: Like(`${FileFolder.AppTarball}/%/${deploymentId}/%`),
      },
    });

    const tarballFile = deploymentFiles.find(({ path }) =>
      path.endsWith(`/${TARBALL_RESOURCE_FILENAME}`),
    );

    if (!isDefined(tarballFile)) {
      throw new ApplicationRegistrationException(
        `Deployment ${deploymentId} has no tarball upload`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const logoFile =
      deploymentFiles.find(({ id }) => id !== tarballFile.id) ?? null;

    const tarballLocation = this.buildStorageLocation({
      workspaceId,
      applicationUniversalIdentifier,
      file: tarballFile,
    });

    await this.fileUploadCompletionService.completeUploadedFileWithinDeadline({
      workspaceId,
      file: tarballFile,
      storageLocation: tarballLocation,
    });

    const uploadedLogo = isDefined(logoFile)
      ? await this.completeLogoUpload({
          workspaceId,
          applicationUniversalIdentifier,
          file: logoFile,
        })
      : null;

    try {
      const registration = await this.registerDeployedTarball({
        tarballBuffer: await this.readStoredFile(tarballLocation),
        ownerWorkspaceId: workspaceId,
        expectedUniversalIdentifier: this.extractDeploymentUniversalIdentifier(
          tarballFile.path,
        ),
        uploadedLogo,
        resolveTarballFileId: async () => tarballFile.id,
      });

      if (isDefined(logoFile)) {
        await this.deleteDeploymentFile({
          workspaceId,
          fileId: logoFile.id,
        });
      }

      return registration;
    } catch (error) {
      for (const file of deploymentFiles) {
        await this.deleteDeploymentFile({ workspaceId, fileId: file.id });
      }

      throw error;
    }
  }

  // Deprecated multipart upload path: the bytes arrive with the request, so
  // the archive is written to storage once its universalIdentifier is known.
  async registerTarball({
    tarballBuffer,
    universalIdentifier,
    ownerWorkspaceId,
  }: {
    tarballBuffer: Buffer;
    universalIdentifier?: string;
    ownerWorkspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    return this.registerDeployedTarball({
      tarballBuffer,
      ownerWorkspaceId,
      expectedUniversalIdentifier: universalIdentifier,
      uploadedLogo: null,
      resolveTarballFileId: async (resolvedUniversalIdentifier) =>
        (
          await this.writeTarballFile({
            universalIdentifier: resolvedUniversalIdentifier,
            tarballBuffer,
            workspaceId: ownerWorkspaceId,
          })
        ).id,
    });
  }

  private async registerDeployedTarball({
    tarballBuffer,
    ownerWorkspaceId,
    expectedUniversalIdentifier,
    uploadedLogo,
    resolveTarballFileId,
  }: {
    tarballBuffer: Buffer;
    ownerWorkspaceId: string;
    expectedUniversalIdentifier?: string;
    uploadedLogo: UploadedLogo | null;
    resolveTarballFileId: (universalIdentifier: string) => Promise<string>;
  }): Promise<ApplicationRegistrationEntity> {
    const tempDir = join(tmpdir(), 'twenty-tarball-upload', v4());

    await fs.mkdir(tempDir, { recursive: true });

    try {
      const { contentDir, manifest, packageJson } =
        await this.extractAndValidateTarball(tempDir, tarballBuffer);

      const universalIdentifier = this.resolveDeployedUniversalIdentifier({
        expectedUniversalIdentifier,
        manifestUniversalIdentifier: manifest.application?.universalIdentifier,
      });

      const existingRegistration = await this.appRegistrationRepository.findOne(
        { where: { universalIdentifier } },
      );

      if (isDefined(existingRegistration)) {
        this.assertRegistrationCanBeDeployedBy({
          registration: existingRegistration,
          workspaceId: ownerWorkspaceId,
          incomingVersion: packageJson?.version,
        });
      }

      const logoPath = this.resolveLogoPath({
        manifestApplication: manifest.application,
        uploadedLogo,
      });

      const readAsset: ReadRegistrationAsset = (path) =>
        isDefined(uploadedLogo) && path === logoPath
          ? Promise.resolve(uploadedLogo.contents)
          : this.readAssetFromContentDir(contentDir, path);

      const tarballFileId = await resolveTarballFileId(universalIdentifier);

      const registration =
        await this.applicationCatalogRegistrationService.registerPublishedVersion(
          {
            universalIdentifier,
            name: manifest.application?.displayName ?? 'Unknown App',
            sourceType: ApplicationRegistrationSourceType.TARBALL,
            sourcePackage: null,
            latestAvailableVersion: packageJson?.version ?? null,
            manifest: (isDefined(uploadedLogo)
              ? {
                  ...manifest,
                  application: { ...manifest.application, logo: logoPath },
                }
              : manifest) as Manifest,
            readAsset,
            additionalFields: {
              tarballFileId,
              isListed: false,
              isVetted: false,
              ownerWorkspaceId,
            },
          },
        );

      const previousTarballFileId = existingRegistration?.tarballFileId;

      if (
        isDefined(previousTarballFileId) &&
        previousTarballFileId !== tarballFileId
      ) {
        await this.deleteDeploymentFile({
          workspaceId: ownerWorkspaceId,
          fileId: previousTarballFileId,
        });
      }

      this.logger.log(
        `Deployed app ${universalIdentifier} (registration ${registration.id})`,
      );

      return registration;
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async createDeploymentUpload({
    workspaceId,
    applicationUniversalIdentifier,
    resourcePath,
    size,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    resourcePath: string;
    size: number;
  }): Promise<FileUploadTargetDTO> {
    const fileId = v4();

    await this.fileStorageService.createPendingFile({
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath,
      fileId,
      size,
      mimeType: DEPLOYMENT_UPLOAD_CONTENT_TYPE,
      settings: TARBALL_FILE_SETTINGS,
    });

    return this.fileUploadTargetService.buildUploadTarget({
      workspaceId,
      fileId,
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier,
      resourcePath,
      contentType: DEPLOYMENT_UPLOAD_CONTENT_TYPE,
      size,
    });
  }

  // A logo that never made it through is not worth failing the deploy over:
  // the previously stored one stays in place.
  private async completeLogoUpload({
    workspaceId,
    applicationUniversalIdentifier,
    file,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    file: FileEntity;
  }): Promise<UploadedLogo | null> {
    const storageLocation = this.buildStorageLocation({
      workspaceId,
      applicationUniversalIdentifier,
      file,
    });

    try {
      await this.fileUploadCompletionService.completeUploadedFileWithinDeadline(
        { workspaceId, file, storageLocation },
      );

      return {
        filename: basename(file.path),
        contents: await this.readStoredFile(storageLocation),
      };
    } catch (error) {
      this.logger.warn(
        `Deploying without a logo: upload ${file.id} could not be completed: ${error}`,
      );

      return null;
    }
  }

  private resolveLogoPath({
    manifestApplication,
    uploadedLogo,
  }: {
    manifestApplication: ApplicationManifest | undefined;
    uploadedLogo: UploadedLogo | null;
  }): string | undefined {
    const declaredLogoPath = manifestApplication?.logo;

    if (!isDefined(uploadedLogo)) {
      return declaredLogoPath;
    }

    return isDefined(declaredLogoPath) && isStorableAssetPath(declaredLogoPath)
      ? declaredLogoPath
      : uploadedLogo.filename;
  }

  private resolveDeployedUniversalIdentifier({
    expectedUniversalIdentifier,
    manifestUniversalIdentifier,
  }: {
    expectedUniversalIdentifier: string | undefined;
    manifestUniversalIdentifier: string | undefined;
  }): string {
    if (
      isDefined(expectedUniversalIdentifier) &&
      isDefined(manifestUniversalIdentifier) &&
      expectedUniversalIdentifier !== manifestUniversalIdentifier
    ) {
      throw new ApplicationRegistrationException(
        `The archive declares universalIdentifier ${manifestUniversalIdentifier} but ${expectedUniversalIdentifier} was announced`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const universalIdentifier =
      expectedUniversalIdentifier ?? manifestUniversalIdentifier;

    if (!isDefined(universalIdentifier)) {
      throw new ApplicationRegistrationException(
        'universalIdentifier is required (in body or manifest)',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    return universalIdentifier;
  }

  private extractDeploymentUniversalIdentifier(filePath: string): string {
    const [, universalIdentifier] = filePath.split('/');

    return universalIdentifier;
  }

  private buildStorageLocation({
    workspaceId,
    applicationUniversalIdentifier,
    file,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    file: FileEntity;
  }): FileUploadStorageLocation {
    return {
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    };
  }

  private async readStoredFile(
    location: FileUploadStorageLocation,
  ): Promise<Buffer> {
    const metadata = await this.fileStorageService.getFileMetadata(location);

    if (!isDefined(metadata)) {
      throw new ApplicationRegistrationException(
        `Uploaded file "${location.resourcePath}" has no content in storage`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    return streamToBuffer(
      await this.fileStorageService.readFile(location),
      metadata.size,
    );
  }

  private async resolveWorkspaceApplicationUniversalIdentifier(
    workspaceId: string,
  ): Promise<string> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    return workspaceCustomFlatApplication.universalIdentifier;
  }

  private async extractAndValidateTarball(
    tempDir: string,
    tarballBuffer: Buffer,
  ): Promise<{
    contentDir: string;
    manifest: { application?: ApplicationManifest };
    packageJson: TarballPackageJson | null;
  }> {
    const tarballPath = join(tempDir, TARBALL_RESOURCE_FILENAME);

    await fs.writeFile(tarballPath, tarballBuffer);

    const extractDir = join(tempDir, 'extracted');

    await fs.mkdir(extractDir, { recursive: true });
    await extractTarballSecurely(tarballPath, extractDir);

    const contentDir = await resolvePackageContentDir(extractDir);

    const manifest = await readJsonFile<{
      application?: ApplicationManifest;
    }>(contentDir, 'manifest.json');

    const packageJson = await readJsonFile<TarballPackageJson>(
      contentDir,
      'package.json',
    );

    if (manifest === null) {
      throw new ApplicationRegistrationException(
        'manifest.json not found or invalid in tarball',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    return { contentDir, manifest, packageJson };
  }

  private assertRegistrationCanBeDeployedBy({
    registration,
    workspaceId,
    incomingVersion,
  }: {
    registration: ApplicationRegistrationEntity;
    workspaceId: string;
    incomingVersion: string | undefined;
  }): void {
    if (
      registration.sourceType !== ApplicationRegistrationSourceType.LOCAL &&
      registration.sourceType !== ApplicationRegistrationSourceType.TARBALL
    ) {
      throw new ApplicationRegistrationException(
        `This app is registered as ${registration.sourceType}. Cannot deploy a tarball.`,
        ApplicationRegistrationExceptionCode.SOURCE_CHANNEL_MISMATCH,
      );
    }

    if (registration.ownerWorkspaceId !== workspaceId) {
      throw new ApplicationRegistrationException(
        `"${registration.universalIdentifier}" is registered to another workspace. Change the universalIdentifier in your manifest, or transfer the registration from the owning workspace.`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
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
          universalIdentifier: registration.universalIdentifier,
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
  }

  private async writeTarballFile({
    universalIdentifier,
    tarballBuffer,
    workspaceId,
  }: {
    universalIdentifier: string;
    tarballBuffer: Buffer;
    workspaceId: string;
  }): Promise<FileEntity> {
    const fileId = v4();

    return this.fileStorageService.writeFile({
      sourceFile: tarballBuffer,
      resourcePath: `${universalIdentifier}/${fileId}/${TARBALL_RESOURCE_FILENAME}`,
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier:
        await this.resolveWorkspaceApplicationUniversalIdentifier(workspaceId),
      workspaceId,
      fileId,
      settings: TARBALL_FILE_SETTINGS,
    });
  }

  private async deleteDeploymentFile({
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
      this.logger.warn(`Could not delete deployment file ${fileId}: ${error}`);
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
