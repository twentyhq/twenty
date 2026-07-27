import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import semver from 'semver';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { extractTarballSecurely } from 'src/engine/core-modules/application/application-package/utils/extract-tarball-securely.util';
import { readJsonFile } from 'src/engine/core-modules/application/application-package/utils/read-json-file.util';
import { resolvePackageContentDir } from 'src/engine/core-modules/application/application-package/utils/tarball-utils';
import {
  ApplicationVersionValidationService,
  type VersionValidationFailureReason,
} from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import type { ApplicationManifest } from 'twenty-shared/application';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';

@Injectable()
export class ApplicationTarballService {
  private readonly logger = new Logger(ApplicationTarballService.name);

  private static readonly VERSION_REASON_TO_EXCEPTION_CODE: Record<
    VersionValidationFailureReason,
    ApplicationRegistrationExceptionCode
  > = {
    INVALID_REQUIRED_VERSION:
      ApplicationRegistrationExceptionCode.INVALID_APP_ENGINE_REQUIREMENT,
    INVALID_SERVER_VERSION:
      ApplicationRegistrationExceptionCode.INVALID_SERVER_VERSION,
    INCOMPATIBLE:
      ApplicationRegistrationExceptionCode.SERVER_VERSION_INCOMPATIBLE,
  };

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly fileStorageService: FileStorageService,
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
          ApplicationTarballService.VERSION_REASON_TO_EXCEPTION_CODE[
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
        where: { universalIdentifier },
      });

      if (isDefined(appRegistration)) {
        this.assertRegistrationOwnership(
          appRegistration,
          params.ownerWorkspaceId,
        );

        this.assertTarballCanReplaceRegistration({
          registration: appRegistration,
          incomingVersion: packageJson?.version,
          universalIdentifier,
        });
      } else {
        const registration = this.appRegistrationRepository.create({
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

        try {
          appRegistration = await this.appRegistrationRepository.save(
            registration,
          );
        } catch (error) {
          if (!this.isUniqueViolation(error)) {
            throw error;
          }

          const existingRegistration =
            await this.appRegistrationRepository.findOne({
              where: { universalIdentifier },
            });

          if (!isDefined(existingRegistration)) {
            throw error;
          }

          appRegistration = existingRegistration;
          this.assertRegistrationOwnership(
            appRegistration,
            params.ownerWorkspaceId,
          );
          this.assertTarballCanReplaceRegistration({
            registration: appRegistration,
            incomingVersion: packageJson?.version,
            universalIdentifier,
          });
        }
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

  private assertRegistrationOwnership(
    registration: ApplicationRegistrationEntity,
    ownerWorkspaceId: string,
  ): void {
    if (registration.ownerWorkspaceId === ownerWorkspaceId) {
      return;
    }

    throw new ApplicationRegistrationException(
      `Universal identifier ${registration.universalIdentifier} is already claimed`,
      ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED,
    );
  }

  private assertTarballCanReplaceRegistration({
    registration,
    incomingVersion,
    universalIdentifier,
  }: {
    registration: ApplicationRegistrationEntity;
    incomingVersion: string | undefined;
    universalIdentifier: string;
  }): void {
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
      if (!isDefined(semver.valid(incomingVersion))) {
        throw new ApplicationRegistrationException(
          `Invalid version "${incomingVersion}" in package.json. Must be a valid semver version.`,
          ApplicationRegistrationExceptionCode.INVALID_INPUT,
        );
      }

      if (
        isDefined(semver.valid(registration.latestAvailableVersion)) &&
        semver.lte(incomingVersion, registration.latestAvailableVersion)
      ) {
        throw new ApplicationRegistrationException(
          `Cannot deploy ${universalIdentifier}@${incomingVersion}: version must be higher than the currently deployed version ${registration.latestAvailableVersion}. Please bump the version in package.json.`,
          ApplicationRegistrationExceptionCode.VERSION_ALREADY_EXISTS,
        );
      }
    }
  }

  private isUniqueViolation(error: unknown): error is QueryFailedError {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const postgresError = error as QueryFailedError & {
      code?: string;
      driverError?: { code?: string };
    };

    return (
      postgresError.code === POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION ||
      postgresError.driverError?.code ===
        POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION
    );
  }
}
