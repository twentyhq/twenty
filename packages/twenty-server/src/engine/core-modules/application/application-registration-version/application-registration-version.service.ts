import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';

export type RecordPublishedVersionParams = {
  applicationRegistrationId: string;
  version: string;
  sourceType: ApplicationRegistrationSourceType;
  sourcePackage?: string | null;
  tarballFileId?: string | null;
  artifactUrl?: string | null;
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
    // Tarballs are stored under their publishing workspace, which the signed
    // download url has to name; the version row only knows the file id.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileUrlService: FileUrlService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  // A version is published once: a retried publish of the same version keeps
  // the row written by the first attempt and never rewrites its provenance.
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
        artifactUrl: params.artifactUrl ?? null,
        checksum: params.checksum ?? null,
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

  // Rows backfilled from a registration snapshot know their version but not
  // where the registry serves it; filling that in completes the record, it
  // never replaces an artifact already recorded.
  async fillMissingArtifact({
    id,
    artifactUrl,
    checksum,
  }: {
    id: string;
    artifactUrl: string;
    checksum: string | null;
  }): Promise<void> {
    await this.applicationRegistrationVersionRepository.update(
      { id, artifactUrl: IsNull() },
      { artifactUrl, checksum },
    );
  }

  async findManyByApplicationRegistrationId(
    applicationRegistrationId: string,
  ): Promise<ApplicationRegistrationVersionEntity[]> {
    return this.applicationRegistrationVersionRepository.find({
      where: { applicationRegistrationId },
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
    });
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

  // Retained tarballs live in the publishing workspace's storage, so the FK
  // cascade that removes the version rows leaves their bytes behind.
  async deleteTarballFilesOfRegistration({
    applicationRegistrationId,
    currentTarballFileId,
  }: {
    applicationRegistrationId: string;
    currentTarballFileId: string | null;
  }): Promise<void> {
    const versions = await this.applicationRegistrationVersionRepository.find({
      select: { tarballFileId: true },
      where: { applicationRegistrationId },
    });

    const tarballFileIds = new Set(
      [
        ...versions.map(({ tarballFileId }) => tarballFileId),
        currentTarballFileId,
      ].filter(isDefined),
    );

    for (const tarballFileId of tarballFileIds) {
      const tarballFile = await this.fileRepository.findOne({
        select: { id: true, workspaceId: true },
        where: { id: tarballFileId },
      });

      if (!isDefined(tarballFile) || !isDefined(tarballFile.workspaceId)) {
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

  // Resolves to the registry url for catalog versions and to a signed url on
  // the stored tarball for uploaded ones, so a reviewer fetches the exact
  // bytes the version was published with.
  async buildArtifactDownloadUrl(
    version: Pick<
      ApplicationRegistrationVersionEntity,
      'sourceType' | 'artifactUrl' | 'tarballFileId'
    >,
  ): Promise<string | null> {
    if (version.sourceType === ApplicationRegistrationSourceType.NPM) {
      return version.artifactUrl;
    }

    if (!isDefined(version.tarballFileId)) {
      return null;
    }

    const tarballFile = await this.fileRepository.findOne({
      select: { id: true, workspaceId: true },
      where: { id: version.tarballFileId },
    });

    if (!isDefined(tarballFile) || !isDefined(tarballFile.workspaceId)) {
      return null;
    }

    return this.fileUrlService.signFileByIdUrl({
      fileId: tarballFile.id,
      workspaceId: tarballFile.workspaceId,
      fileFolder: FileFolder.AppTarball,
    });
  }
}
