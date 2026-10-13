import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ApplicationRegistrationVersionArtifactService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version-artifact.service';
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
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileUrlService: FileUrlService,
    private readonly fileStorageService: FileStorageService,
    private readonly applicationRegistrationVersionArtifactService: ApplicationRegistrationVersionArtifactService,
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

  async fillMissingArtifact({
    id,
    artifactUrl,
    checksum,
  }: {
    id: string;
    artifactUrl: string | null;
    checksum: string | null;
  }): Promise<void> {
    await this.applicationRegistrationVersionRepository
      .createQueryBuilder()
      .update()
      .set({
        artifactUrl: () => 'COALESCE("artifactUrl", :artifactUrl)',
        checksum: () => 'COALESCE("checksum", :checksum)',
      })
      .where('id = :id AND ("artifactUrl" IS NULL OR "checksum" IS NULL)', {
        id,
      })
      .setParameters({ artifactUrl, checksum })
      .execute();
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

    const tarballFileIds = [
      ...new Set(
        [
          ...versions.map(({ tarballFileId }) => tarballFileId),
          currentTarballFileId,
        ].filter(isDefined),
      ),
    ];

    if (tarballFileIds.length === 0) {
      return;
    }

    const tarballFiles = await this.fileRepository.find({
      select: { id: true, workspaceId: true },
      where: { id: In(tarballFileIds) },
    });

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

  async buildArtifactDownloadUrl(
    version: Pick<
      ApplicationRegistrationVersionEntity,
      'id' | 'sourceType' | 'artifactUrl' | 'tarballFileId'
    >,
  ): Promise<string | null> {
    if (version.sourceType === ApplicationRegistrationSourceType.NPM) {
      return isDefined(version.artifactUrl)
        ? this.applicationRegistrationVersionArtifactService.signRegistryArtifactDownloadUrl(
            version.id,
          )
        : null;
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
