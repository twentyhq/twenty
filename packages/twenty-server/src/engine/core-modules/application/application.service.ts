import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async findWorkspaceTwentyStandardAndCustomApplicationOrThrow({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (!isDefined(workspace)) {
      throw new ApplicationException(
        `Could not find workspace ${workspaceId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const [workspaceCustomApplication, twentyStandardApplication] =
      await Promise.all([
        this.findById(workspace.workspaceCustomApplicationId),
        this.findByUniversalIdentifier({
          universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
          workspaceId: workspace.id,
        }),
      ]);

    if (
      !isDefined(twentyStandardApplication) ||
      !isDefined(workspaceCustomApplication)
    ) {
      throw new ApplicationException(
        `Could not find workspace custom and standard applications ${workspace.id}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return {
      twentyStandardApplication,
      workspaceCustomApplication,
    };
  }

  async findManyApplications(
    workspaceId: string,
  ): Promise<ApplicationEntity[]> {
    return this.applicationRepository.find({
      where: { workspaceId },
      relations: [
        'serverlessFunctions',
        'agents',
        'objects',
        'applicationVariables',
      ],
    });
  }

  async findOneApplication(
    applicationId: string,
    workspaceId: string,
  ): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne({
      where: { workspaceId, id: applicationId },
      relations: [
        'serverlessFunctions',
        'agents',
        'objects',
        'applicationVariables',
      ],
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application with id ${applicationId} not found`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return application;
  }

  async findById(id: string): Promise<ApplicationEntity | null> {
    return this.applicationRepository.findOne({
      where: { id },
    });
  }

  async findByUniversalIdentifier({
    universalIdentifier,
    workspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
  }) {
    return this.applicationRepository.findOne({
      where: {
        universalIdentifier,
        workspaceId,
      },
    });
  }

  async createTwentyStandardApplication(
    {
      workspaceId,
    }: {
      workspaceId: string;
    },
    queryRunner?: QueryRunner,
  ) {
    return await this.create(
      {
        ...TWENTY_STANDARD_APPLICATION,
        serverlessFunctionLayerId: null,
        workspaceId,
      },
      queryRunner,
    );
  }

  async create(
    data: {
      universalIdentifier?: string;
      name: string;
      description?: string;
      version?: string;
      serverlessFunctionLayerId: string | null;
      sourcePath: string;
      workspaceId: string;
    },
    queryRunner?: QueryRunner,
  ): Promise<ApplicationEntity> {
    const application = this.applicationRepository.create({
      ...data,
      sourceType: 'local',
    });

    if (queryRunner) {
      return queryRunner.manager.save(ApplicationEntity, application);
    }

    return this.applicationRepository.save(application);
  }

  async update(
    id: string,
    data: Parameters<typeof this.applicationRepository.update>[1],
  ): Promise<ApplicationEntity> {
    await this.applicationRepository.update({ id }, data);

    const updatedApplication = await this.findById(id);

    if (!updatedApplication) {
      throw new Error(`Failed to update application with id ${id}`);
    }

    return updatedApplication;
  }

  async delete(universalIdentifier: string, workspaceId: string) {
    const application = await this.findByUniversalIdentifier({
      universalIdentifier,
      workspaceId,
    });

    if (!isDefined(application)) {
      throw new Error(`Application does not exist`);
    }

    await this.applicationRepository.delete({
      universalIdentifier,
      workspaceId,
    });

    await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
      workspaceId,
    });
  }
}
