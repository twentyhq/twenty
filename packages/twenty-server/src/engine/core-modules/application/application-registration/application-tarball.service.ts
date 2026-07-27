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
import type { ApplicationManifest, Manifest } from 'twenty-shared/application';

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
  ) {}

  async uploadTarball(params: {
    tarballBuffer: Buffer;
    universalIdentifier?: string;
    ownerWorkspaceId: string;
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

      const savedFile = await this.storeTarballFile({
        appRegistration,
        tarballBuffer: params.tarballBuffer,
        ownerWorkspaceId: params.ownerWorkspaceId,
      });

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

    return this.fileStorageService.writeFile({
      sourceFile: tarballBuffer,
      resourcePath: `${appRegistration.id}/app.tar.gz`,
      fileFolder: FileFolder.AppTarball,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      workspaceId: ownerWorkspaceId,
      fileId: appRegistration.tarballFileId ?? v4(),
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
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
}
