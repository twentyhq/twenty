import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import semver from 'semver';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { extractTarballSecurely } from 'src/engine/core-modules/application/application-package/utils/extract-tarball-securely.util';
import { readJsonFile } from 'src/engine/core-modules/application/application-package/utils/read-json-file.util';
import { resolvePackageContentDir } from 'src/engine/core-modules/application/application-package/utils/tarball-utils';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import type { ApplicationManifest } from 'twenty-shared/application';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';

export const MAX_TARBALL_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;

@Injectable()
export class ApplicationTarballService {
  private readonly logger = new Logger(ApplicationTarballService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly applicationService: ApplicationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
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
      }>(contentDir, 'package.json');

      if (manifest === null) {
        throw new ApplicationRegistrationException(
          'manifest.json not found or invalid in tarball',
          ApplicationRegistrationExceptionCode.INVALID_INPUT,
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
          latestAvailableVersion: packageJson?.version ?? null,
          isListed: false,
          isFeatured: false,
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
        mimeType: 'application/gzip',
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
        latestAvailableVersion: packageJson?.version ?? null,
        isListed: false,
        isFeatured: false,
        ownerWorkspaceId: params.ownerWorkspaceId,
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
}
