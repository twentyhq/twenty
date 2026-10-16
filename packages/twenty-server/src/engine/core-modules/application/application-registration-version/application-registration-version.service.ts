import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, IsNull, Repository } from 'typeorm';

import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

export type CreateApplicationRegistrationVersionParams = {
  applicationRegistrationId: string;
  version: string;
  sourceType: ApplicationRegistrationSourceType;
  sourcePackage?: string | null;
  tarballFileId?: string | null;
  tarballUrl?: string | null;
};

@Injectable()
export class ApplicationRegistrationVersionService {
  private readonly logger = new Logger(
    ApplicationRegistrationVersionService.name,
  );

  constructor(
    @InjectRepository(ApplicationRegistrationVersionEntity)
    private readonly applicationRegistrationVersionRepository: Repository<ApplicationRegistrationVersionEntity>,
  ) {}

  async createApplicationRegistrationVersion(
    params: CreateApplicationRegistrationVersionParams,
    entityManager?: EntityManager,
  ): Promise<ApplicationRegistrationVersionEntity> {
    const repository =
      entityManager?.getRepository(ApplicationRegistrationVersionEntity) ??
      this.applicationRegistrationVersionRepository;
    const insertResult = await repository
      .createQueryBuilder()
      .insert()
      .values({
        applicationRegistrationId: params.applicationRegistrationId,
        version: params.version,
        sourceType: params.sourceType,
        sourcePackage: params.sourcePackage ?? null,
        tarballFileId: params.tarballFileId ?? null,
        tarballUrl: params.tarballUrl ?? null,
        publishedAt: new Date(),
      })
      .orIgnore()
      .execute();

    if (insertResult.raw.length > 0) {
      this.logger.log(
        `Recorded version ${params.version} of registration ${params.applicationRegistrationId}`,
      );
    }

    return repository.findOneOrFail({
      where: {
        applicationRegistrationId: params.applicationRegistrationId,
        version: params.version,
      },
    });
  }

  async ensureNpmVersion({
    applicationRegistrationId,
    version,
    sourcePackage,
    tarballUrl,
  }: {
    applicationRegistrationId: string;
    version: string;
    sourcePackage: string | null;
    tarballUrl: string;
  }): Promise<void> {
    const publishedVersion = await this.createApplicationRegistrationVersion({
      applicationRegistrationId,
      version,
      sourceType: ApplicationRegistrationSourceType.NPM,
      sourcePackage,
      tarballUrl,
    });

    if (!isDefined(publishedVersion.tarballUrl)) {
      await this.applicationRegistrationVersionRepository.update(
        { id: publishedVersion.id, tarballUrl: IsNull() },
        { tarballUrl },
      );
    }
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

  async findTarballFilesOfRegistration(
    applicationRegistrationId: string,
  ): Promise<FileEntity[]> {
    const versions = await this.applicationRegistrationVersionRepository.find({
      where: { applicationRegistrationId },
      relations: { tarballFile: true },
    });

    return versions.map(({ tarballFile }) => tarballFile).filter(isDefined);
  }
}
