import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
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

  async findOneByIdOrThrow(
    id: string,
  ): Promise<ApplicationRegistrationVersionEntity> {
    const version = await this.applicationRegistrationVersionRepository.findOne(
      { where: { id } },
    );

    if (!isDefined(version)) {
      throw new ApplicationRegistrationException(
        `Application registration version with id ${id} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_VERSION_NOT_FOUND,
      );
    }

    return version;
  }

  async isTarballFileReferenced(tarballFileId: string): Promise<boolean> {
    return this.applicationRegistrationVersionRepository.exists({
      where: { tarballFileId },
    });
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
