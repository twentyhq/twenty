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
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { fromManifestApplicationToDisplayFields } from 'src/engine/core-modules/application/application-registration/utils/from-manifest-application-to-display-fields.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import type { ApplicationManifest, Manifest } from 'twenty-shared/application';

@Injectable()
export class ApplicationTarballService {
  private readonly logger = new Logger(ApplicationTarballService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly applicationRegistrationAssetService: ApplicationRegistrationAssetService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationService: ApplicationService,
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
          const progression =
            this.applicationVersionValidationService.validateVersionProgression(
              {
                incomingVersion: packageJson.version,
                currentVersion: appRegistration.latestAvailableVersion,
                universalIdentifier,
                action: 'deploy',
              },
            );

          if (!progression.allowed) {
            throw new ApplicationRegistrationException(
              progression.message,
              VERSION_PROGRESSION_REASON_TO_DEPLOY_EXCEPTION_CODE[
                progression.reason
              ],
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

      // Routed through the single registration writer so the tarball flow
      // serializes with installs and dev sync on the per-registration lock
      // and gets the same variable schema handling.
      await this.applicationRegistrationService.updateFromManifest({
        applicationRegistrationId: appRegistration.id,
        manifest: manifest as Manifest,
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        latestAvailableVersion: packageJson?.version ?? null,
        additionalFields: {
          tarballFileId: savedFile.id,
          isListed: false,
          isVetted: false,
          ownerWorkspaceId: params.ownerWorkspaceId,
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

      return this.appRegistrationRepository.findOneOrFail({
        where: { id: appRegistration.id },
      });
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
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
