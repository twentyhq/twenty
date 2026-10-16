import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';

import { type ResolvedPackage } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { assertSriIntegrityMatches } from 'src/engine/core-modules/application/application-registration-version/utils/assert-sri-integrity-matches.util';

export type RecordPublishedVersionParams = {
  applicationRegistrationId: string;
  version: string;
  sourceType: ApplicationRegistrationSourceType;
  sourcePackage?: string | null;
  tarballFileId?: string | null;
  tarballUrl?: string | null;
  checksum?: string | null;
  publishedByUserId?: string | null;
  publishedByWorkspaceId?: string | null;
};

@Injectable()
export class ApplicationRegistrationVersionService {
  private readonly logger = new Logger(
    ApplicationRegistrationVersionService.name,
  );

  constructor(
    @InjectRepository(ApplicationRegistrationVersionEntity)
    private readonly applicationRegistrationVersionRepository: Repository<ApplicationRegistrationVersionEntity>,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async recordPublishedVersion(
    params: RecordPublishedVersionParams,
  ): Promise<ApplicationRegistrationVersionEntity> {
    const insertResult = await this.applicationRegistrationVersionRepository
      .createQueryBuilder()
      .insert()
      .values({
        applicationRegistrationId: params.applicationRegistrationId,
        version: params.version,
        sourceType: params.sourceType,
        sourcePackage: params.sourcePackage ?? null,
        tarballFileId: params.tarballFileId ?? null,
        tarballUrl: params.tarballUrl ?? null,
        checksum:
          params.sourceType === ApplicationRegistrationSourceType.TARBALL
            ? (params.checksum ?? null)
            : null,
        publishedByUserId: params.publishedByUserId ?? null,
        publishedByWorkspaceId: params.publishedByWorkspaceId ?? null,
        publishedAt: new Date(),
      })
      .orIgnore()
      .execute();

    if (insertResult.raw.length > 0) {
      this.logger.log(
        `Recorded version ${params.version} of registration ${params.applicationRegistrationId}`,
      );
    }

    return this.applicationRegistrationVersionRepository.findOneOrFail({
      where: {
        applicationRegistrationId: params.applicationRegistrationId,
        version: params.version,
      },
    });
  }

  async resolveInstalledVersionIdOrThrow({
    appRegistration,
    resolvedPackage,
    version,
  }: {
    appRegistration: Pick<
      ApplicationRegistrationEntity,
      'id' | 'sourceType' | 'sourcePackage' | 'universalIdentifier'
    >;
    resolvedPackage: Pick<ResolvedPackage, 'integrity' | 'registryTarballUrl'>;
    version: string;
  }): Promise<string | null> {
    const recordedVersion =
      await this.findOneByApplicationRegistrationIdAndVersion({
        applicationRegistrationId: appRegistration.id,
        version,
      });

    if (!isDefined(recordedVersion)) {
      if (
        appRegistration.sourceType !== ApplicationRegistrationSourceType.NPM ||
        !isDefined(resolvedPackage.registryTarballUrl)
      ) {
        return null;
      }

      const npmVersion = await this.recordPublishedVersion({
        applicationRegistrationId: appRegistration.id,
        version,
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage: appRegistration.sourcePackage,
        tarballUrl: resolvedPackage.registryTarballUrl,
      });

      return npmVersion.id;
    }

    if (
      recordedVersion.sourceType === ApplicationRegistrationSourceType.TARBALL
    ) {
      if (!isDefined(recordedVersion.checksum)) {
        await this.applicationRegistrationVersionRepository.update(
          { id: recordedVersion.id, checksum: IsNull() },
          { checksum: resolvedPackage.integrity },
        );
      }

      const checksum =
        recordedVersion.checksum ??
        (
          await this.applicationRegistrationVersionRepository.findOneOrFail({
            where: { id: recordedVersion.id },
          })
        ).checksum;

      assertSriIntegrityMatches({
        expected: checksum,
        actual: resolvedPackage.integrity,
        subject: `Package resolved for ${appRegistration.universalIdentifier}@${version}`,
      });
    } else if (
      !isDefined(recordedVersion.tarballUrl) &&
      isDefined(resolvedPackage.registryTarballUrl)
    ) {
      await this.fillMissingTarball({
        id: recordedVersion.id,
        tarballUrl: resolvedPackage.registryTarballUrl,
      });
    }

    return recordedVersion.id;
  }

  async fillMissingTarball({
    id,
    tarballUrl,
  }: {
    id: string;
    tarballUrl: string;
  }): Promise<void> {
    await this.applicationRegistrationVersionRepository.update(
      { id, tarballUrl: IsNull() },
      { tarballUrl },
    );
  }

  async findOneByApplicationRegistrationIdAndVersion({
    applicationRegistrationId,
    version,
  }: {
    applicationRegistrationId: string;
    version: string;
  }): Promise<ApplicationRegistrationVersionEntity | null> {
    return this.applicationRegistrationVersionRepository.findOne({
      where: { applicationRegistrationId, version },
    });
  }

  async isTarballFileReferenced(tarballFileId: string): Promise<boolean> {
    return this.applicationRegistrationVersionRepository.exists({
      where: { tarballFileId },
    });
  }

  async deleteTarballFilesOfRegistration(
    applicationRegistrationId: string,
  ): Promise<void> {
    const versions = await this.applicationRegistrationVersionRepository.find({
      where: { applicationRegistrationId },
      relations: { tarballFile: true },
    });
    const registration =
      await this.applicationRegistrationRepository.findOneOrFail({
        where: { id: applicationRegistrationId },
        relations: { tarballFile: true },
      });
    const files = [
      ...versions.map(({ tarballFile }) => tarballFile),
      registration.tarballFile,
    ].filter(isDefined);
    const tarballFiles = [
      ...new Map(files.map((file) => [file.id, file])).values(),
    ];

    for (const tarballFile of tarballFiles) {
      if (!isDefined(tarballFile.workspaceId)) {
        continue;
      }

      try {
        await this.fileStorageService.deleteByFileId({
          fileId: tarballFile.id,
          workspaceId: tarballFile.workspaceId,
          fileFolder: FileFolder.AppTarball,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to delete tarball file ${tarballFile.id} of registration ${applicationRegistrationId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}
