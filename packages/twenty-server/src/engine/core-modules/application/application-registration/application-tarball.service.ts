import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { isAbsolute, join, relative, resolve } from 'path';

import semver from 'semver';
import { FileFolder, ServerFileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { VERSION_REASON_TO_APPLICATION_REGISTRATION_EXCEPTION_CODE } from 'src/engine/core-modules/application/application-package/constants/version-reason-to-exception-code.constant';
import { extractTarballSecurely } from 'src/engine/core-modules/application/application-package/utils/extract-tarball-securely.util';
import { readJsonFile } from 'src/engine/core-modules/application/application-package/utils/read-json-file.util';
import { resolvePackageContentDir } from 'src/engine/core-modules/application/application-package/utils/tarball-utils';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationRegistrationGalleryImage } from 'src/engine/core-modules/application/application-registration/types/application-registration-gallery-image.type';
import { fromManifestApplicationToDisplayFields } from 'src/engine/core-modules/application/application-registration/utils/from-manifest-application-to-display-fields.util';
import { isImageFilePath } from 'src/engine/core-modules/application/application-registration/utils/is-image-file-path.util';
import { toGalleryImagePaths } from 'src/engine/core-modules/application/application-registration/utils/to-gallery-image-paths.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import { prepareFileForStorageOrThrow } from 'src/engine/core-modules/file-storage/utils/prepare-file-for-storage-or-throw.util';
import type { ApplicationManifest } from 'twenty-shared/application';

@Injectable()
export class ApplicationTarballService {
  private readonly logger = new Logger(ApplicationTarballService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly serverFileStorageService: ServerFileStorageService,
    private readonly applicationService: ApplicationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private readonly applicationVersionValidationService: ApplicationVersionValidationService,
  ) {}

  async uploadTarball(params: {
    tarballBuffer: Buffer;
    universalIdentifier?: string;
    ownerWorkspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const tempDir = join(tmpdir(), 'twenty-tarball-upload', v4());

    await fs.mkdir(tempDir, { recursive: true });

    try {
      const tarballPath = join(tempDir, 'app.tar.gz');

      await fs.writeFile(tarballPath, params.tarballBuffer);

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

      const requiredServerVersion = packageJson?.engines?.twenty;

      const versionValidation =
        await this.applicationVersionValidationService.validateServerCompatibility(
          requiredServerVersion,
        );

      if (!versionValidation.compatible) {
        throw new ApplicationRegistrationException(
          versionValidation.message,
          VERSION_REASON_TO_APPLICATION_REGISTRATION_EXCEPTION_CODE[
            versionValidation.reason
          ],
        );
      }

      const universalIdentifier =
        params.universalIdentifier ?? manifest.application?.universalIdentifier;

      if (!isDefined(universalIdentifier)) {
        throw new ApplicationRegistrationException(
          'universalIdentifier is required (in body or manifest)',
          ApplicationRegistrationExceptionCode.INVALID_INPUT,
        );
      }

      let appRegistration = await this.appRegistrationRepository.findOne({
        where: {
          universalIdentifier,
          ownerWorkspaceId: params.ownerWorkspaceId,
        },
      });

      if (isDefined(appRegistration)) {
        if (
          appRegistration.sourceType !==
            ApplicationRegistrationSourceType.LOCAL &&
          appRegistration.sourceType !==
            ApplicationRegistrationSourceType.TARBALL
        ) {
          throw new ApplicationRegistrationException(
            `This app is registered as ${appRegistration.sourceType}. Cannot upload tarball.`,
            ApplicationRegistrationExceptionCode.SOURCE_CHANNEL_MISMATCH,
          );
        }

        if (
          appRegistration.sourceType ===
            ApplicationRegistrationSourceType.TARBALL &&
          isDefined(appRegistration.latestAvailableVersion) &&
          isDefined(packageJson?.version)
        ) {
          const incomingVersion = packageJson.version;
          const currentVersion = appRegistration.latestAvailableVersion;

          if (!isDefined(semver.valid(incomingVersion))) {
            throw new ApplicationRegistrationException(
              `Invalid version "${incomingVersion}" in package.json. Must be a valid semver version.`,
              ApplicationRegistrationExceptionCode.INVALID_INPUT,
            );
          }

          if (
            isDefined(semver.valid(currentVersion)) &&
            semver.lte(incomingVersion, currentVersion)
          ) {
            throw new ApplicationRegistrationException(
              `Cannot deploy ${universalIdentifier}@${incomingVersion}: version must be higher than the currently deployed version ${currentVersion}. Please bump the version in package.json.`,
              ApplicationRegistrationExceptionCode.VERSION_ALREADY_EXISTS,
            );
          }
        }
      } else {
        appRegistration = this.appRegistrationRepository.create({
          universalIdentifier,
          name: manifest.application?.displayName ?? 'Unknown App',
          sourceType: ApplicationRegistrationSourceType.TARBALL,
          manifest,
          ...fromManifestApplicationToDisplayFields(manifest.application),
          latestAvailableVersion: packageJson?.version ?? null,
          isListed: false,
          isVetted: false,
          oAuthClientId: v4(),
          oAuthRedirectUris: [],
          oAuthScopes: [],
          ownerWorkspaceId: params.ownerWorkspaceId,
        });

        appRegistration =
          await this.appRegistrationRepository.save(appRegistration);
      }

      const { workspaceCustomFlatApplication } =
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId: params.ownerWorkspaceId },
        );

      const savedFile = await this.fileStorageService.writeFile({
        sourceFile: params.tarballBuffer,
        resourcePath: `${appRegistration.id}/app.tar.gz`,
        fileFolder: FileFolder.AppTarball,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        workspaceId: params.ownerWorkspaceId,
        fileId: appRegistration.tarballFileId ?? v4(),
        settings: {
          isTemporaryFile: false,
          toDelete: false,
        },
      });

      await this.appRegistrationRepository.update(appRegistration.id, {
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        tarballFileId: savedFile.id,
        name: manifest.application?.displayName ?? 'Unknown App',
        manifest,
        ...fromManifestApplicationToDisplayFields(manifest.application),
        latestAvailableVersion: packageJson?.version ?? null,
        isListed: false,
        isVetted: false,
        ownerWorkspaceId: params.ownerWorkspaceId,
      } as QueryDeepPartialEntity<ApplicationRegistrationEntity>);

      await this.storeGalleryImageFiles({
        applicationRegistrationId: appRegistration.id,
        manifestApplication: manifest.application,
        contentDir,
      });

      if (manifest.application?.serverVariables) {
        await this.applicationRegistrationVariableService.syncVariableSchemas(
          appRegistration.id,
          manifest.application.serverVariables,
        );
      }

      this.logger.log(
        `Tarball uploaded for app ${universalIdentifier} (registration ${appRegistration.id})`,
      );

      return this.appRegistrationRepository.findOneOrFail({
        where: { id: appRegistration.id },
      });
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async storeGalleryImageFiles({
    applicationRegistrationId,
    manifestApplication,
    contentDir,
  }: {
    applicationRegistrationId: string;
    manifestApplication: ApplicationManifest | undefined;
    contentDir: string;
  }): Promise<void> {
    const galleryImages: ApplicationRegistrationGalleryImage[] = [];

    for (const path of toGalleryImagePaths(manifestApplication)) {
      const fileId = await this.storeGalleryImageFile({
        applicationRegistrationId,
        contentDir,
        path,
      });

      if (isDefined(fileId)) {
        galleryImages.push({ path, fileId });
      }
    }

    await this.appRegistrationRepository.update(applicationRegistrationId, {
      galleryImages,
    } as QueryDeepPartialEntity<ApplicationRegistrationEntity>);
  }

  private async storeGalleryImageFile({
    applicationRegistrationId,
    contentDir,
    path,
  }: {
    applicationRegistrationId: string;
    contentDir: string;
    path: string;
  }): Promise<string | null> {
    if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      !isImageFilePath(path)
    ) {
      return null;
    }

    const absolutePath = resolve(contentDir, path);
    const relativeToContentDir = relative(contentDir, absolutePath);

    if (
      relativeToContentDir === '..' ||
      relativeToContentDir.startsWith('../') ||
      isAbsolute(relativeToContentDir)
    ) {
      this.logger.warn(
        `Gallery image "${path}" escapes the package directory; skipping`,
      );

      return null;
    }

    try {
      const contents = await fs.readFile(absolutePath);

      const { sourceFile, mimeType } = await prepareFileForStorageOrThrow({
        sourceFile: contents,
        resourcePath: path,
      });

      const savedFile = await this.serverFileStorageService.writeServerFile({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId,
        resourcePath: path,
        contents: Buffer.isBuffer(sourceFile)
          ? sourceFile
          : Buffer.from(sourceFile),
        mimeType,
      });

      return savedFile.id;
    } catch (error) {
      this.logger.warn(
        `Failed to store gallery image "${path}" for registration ${applicationRegistrationId}: ${error.message}`,
      );

      return null;
    }
  }
}
